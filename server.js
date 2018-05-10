const fs = require('fs');
const path = require('path');

/** Dependencies  */
const express = require('express'); // framework for node to set up web application (sets up the middleware)
const mysql = require('mysql'); // for connection to mysql
const bodyParser = require('body-parser'); // for parsing http request data
const siofu = require('socketio-file-upload'); // for image uploading
const passport = require('passport'); // for authentication
const session = require('express-session'); // for session handling
const env = require('dotenv').load();
const exphbs = require('express-handlebars'); // for rendering dynamic templates


/** Exports made */
var models = require("./app/models"); // tells the server to require these routes 
var authRoute = require('./app/routes/auth.js');
var dbconfig = require('./app/public/js/dbconfig.js');

const port = 8000;

var app = express().use(siofu.router); // adds siofu as a router, middleware

// links express app the server; then links socketio to server
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/* Parses the content-type that is transfered over HTTP */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// For Passport
app.use(session({
  secret: 'foodboard kitten',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
  }
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


/*************************************************************************
 * 
 *       HANDLEBARS ENVIRONMENT
 * 
 *************************************************************************/

app.use(express.static(__dirname + '/app/'));
app.set('views', './app/views/')
app.engine('handlebars',
  exphbs({
    layoutsDir: `${__dirname}/app/views/layouts`,
    partialsDir: `${__dirname}/app/views/partials`,
  })
);

app.set('view engine', 'handlebars');

/**
 * Renders the homepage when you first open the port
 */
app.get('/', (req, res) => {
  res.render('home.handlebars');
});

app.get('/snake', (req, res) => {
  res.render('snake');
});

app.get('/boardpagero', (req, res) => {
  res.render('boardpagero');
});

app.get('/boardpagero_home', (req, res) => {
  res.render('boardpagero_home');
});

/*************************************************************************
 * 
 *         FOOD BOARD LOGIN/REGISTER FEATURE - SERVER SIDE
 * 
 * 
 *************************************************************************/


authRoute.validate(app, passport);


//load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

//Sync Database
models.sequelize.sync().then(() => {
  console.log('Nice! Database looks fine');

}).catch((err) => {
  console.log(err, "Something went wrong with the Database Update!");
});

var connection;

handleDisconnect();


/**
 * Socketio detects that connection has been made to the server.
 * The connection event is fired, whenever anyone goes to foodboard.ca.
 */
io.on('connection', (socket) => {
  console.log('user connected');

  /** Initalizes the stockio-file-upload object */
  const uploader = new siofu();
  uploader.dir = path.join(__dirname, '/app/images'); // sets the upload directory
  uploader.listen(socket); // listens for image uploads

  /*************************************************************************
   * 
   *         FOOD BOARD LOAD FEATURE - SERVER SIDE
   * 
   * Fired as soon as user is connected to server
   * 
   ***********************************  **************************************/


  /**
   * When the user has ac omplete loaded page, fetch data from db to print posts
   * to screen. 
   */
  socket.on('page loaded', () => {
    console.log('Server: page loaded')
    /** Grab All Food Items from DB */
    var foodboardItems = "SELECT * FROM FoodItem";
    connection.query(foodboardItems, (error, rows, fields) => {
      if (error) {
        console.log("Error grabbing food items");
      } else if (!rows.length) {
        console.log("Database is empty.");
      } else {
        console.log("Successfully grabbed food items.");
        console.log('Rows:', rows);

        /* Sends list of food items to the client to print to browser */
        socket.emit('load foodboard', rows);
      }
    });
  });



  /*************************************************************************
   * 
   *         FOOD BOARD POST FEATURE - SERVER SIDE
   * 
   *************************************************************************/

  /** Handles 'post item' event that is fired from the index.html.  */
  socket.on('post item', (item) => {
    var query = `SELECT sessionID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${item.sessionID}') LIMIT 1`;
    connection.query(query, (error, rows, fields) => {
      if (error) {
        console.log(error);
      }
      console.log("this is length of rows:", rows.length);
      if (rows.length) {
        console.log("fired");
        let foodName = item.name;
        let foodDescription = item.description;
        let foodGroup = item.foodgrouping;
        let dateLocalTime = item.dateTime;
        let foodImage = item.image;
        let id;

        /** Inserts data into database */
        var foodItem = "INSERT INTO FoodItem (foodName, foodDescription, foodGroup,  foodExpiryTime, foodImage) VALUES (?, ?, ?, ?, ?)";
        connection.query(foodItem, [foodName, foodDescription, foodGroup, dateLocalTime, foodImage], (error, rows, field) => {
          if (error) {
            // return error if insertion fail
            console.log("Error inserting" + error);
            console.log(error);
          } else {
            // else return the updated table
            console.log("Successful insertion:", rows);
            id = rows.insertId;
          }
        });


        /* Once image transfer has complete, tell client to create it's card */
        uploader.once('complete', () => {
          console.log('File Transfer Completed...');
          io.emit('post item return', {
            id: id,
            name: foodName,
            description: foodDescription,
            dateTime: dateLocalTime,
            foodgrouping: foodGroup,
            image: foodImage
          });
        });
      } else {
        app.post('/nicetrybud');
      }
    });
  });
});


/*************************************************************************
 * 
 *     MYSQL HANDLE DISCONNECT
 * 
 ***********************************  **************************************/


function handleDisconnect() {


  connection = mysql.createConnection(dbconfig); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {                 // The server is either down
    if (err) {                                        // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);             // We introduce a delay before attempting to reconnect,
    }                                                 // to avoid a hot loop, and to allow our node script to
  });                                                 // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.

  connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {    // Connection to the MySQL server is usually
      handleDisconnect();                             // lost due to either server restart, or a
    } else {                                          // connnection idle timeout (the wait_timeout
      throw err;                                      // server variable configures this)
    }
  });
};

// The port we are listening on
server.listen(port, () => {
  console.log(`We are on port ${port}`);
});

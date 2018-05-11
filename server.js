const fs = require('fs');
const path = require('path');

/** Dependencies  */
const express = require('express'); // framework for node to set up web application (sets up the middleware)
const mysql = require('mysql'); // for connection to mysql
const bodyParser = require('body-parser'); // for parsing http request data
const siofu = require('socketio-file-upload'); // for image uploading w/ sockets 
const passport = require('passport'); // for authentication
const session = require('express-session'); // for session handling
const env = require('dotenv').load();
const exphbs = require('express-handlebars'); // for rendering dynamic templates
const nodemailer = require('nodemailer'); // for sending automated emails


/** Exports made */
var models = require("./app/models"); // tells the server to require these routes 
var authRoute = require('./app/routes/auth.js');
var dbconfig = require('./app/public/js/dbconfig.js');
var mysqlconnection = require('./app/public/js/mysqlconnection.js');

const port = 9000;

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
    maxAge: 1800000
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

var connection = mysqlconnection.handleDisconnect(dbconfig);


/*************************************************************************
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
   *************************************************************************/


  /**
   * When the user has a complete loaded page, fetch data from db to print posts
   * to screen. 
   */
  socket.on('page loaded', () => {
    console.log('Server: page loaded')
    /** Grab All Food Items from DB */

    var claimedItemSearch = "SELECT FoodItem_ItemID FROM Posting WHERE claimStatus = 1";
    connection.query(claimedItemSearch, (error, rows, field) => {
      if (error) {
        //return error if searching claimed posts fails
        console.log("Error occured while querying for claimed posts", error);
      } else if (rows.length < 1) {
        console.log(rows.length + " claimed items, no deletion occured.");
      } else {
        console.log("Successful query of claimed food items", rows.length);
        for (var i = 0; i < rows.length; i++) {

          var tempItemID = rows[i].FoodItem_ItemID;
          //delete claimed items from FoodItem table before loading foodboard
          deleteFoodItem(tempItemID);
        }
      }
    });

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

    let userID;
    var query = `SELECT sessionID, Users_UserID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${item.sessionID}') LIMIT 1`;
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
        let itemID;
        console.log("this is the user ID", rows[0].Users_UserID)
        userID = rows[0].Users_UserID;

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
            itemID = rows.insertId;
          }
          /* Inserts data into Posting Table */
          insertIntoPostingTable(itemID, userID);
        });



        /* Once image transfer has complete, tell client to create it's card */
        uploader.once('complete', () => {
          console.log('File Transfer Completed...');
          io.emit('post item return', {
            id: itemID,
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

  /*************************************************************************
   * 
   *         FOOD BOARD DELETE FEATURE - SERVER SIDE
   * 
   *************************************************************************/
  socket.on('delete item', (deletion) => {

    deleteFoodItem(itemID)

    io.emit('deletion return', (itemID));
  });

  /*************************************************************************
   * 
   *         FOOD BOARD CLAIM FEATURE - SERVER SIDE
   * 
   *************************************************************************/


  socket.on('claim item', (claim) => {
    console.log("Claim entered.");
    //Declares variables needed to generate automated claim email
    var itemID = claim.id;
    //console.log(itemID);
    var postID;
    var posterUserID;
    var posterEmail;
    var posterFirstName;
    //let posterSuiteNumber;
    //let postingDescription;
    //let postingExpiryDate;

    //let claimerEmail;
    //let claimerFirstName;
    //let claimerSuiteNumber;

    var postingTableQuery = "SELECT Users_UserID, postID FROM Posting WHERE FoodItem_ItemID = ? LIMIT 1";
    connection.query(postingTableQuery, [itemID], (error, row, field) => {
      if (error) {
        //return error if Posting Table query fail
        console.log("Error grabbing userID and postID from posting table: ", error);
      } else {
        // else return the updated table
        console.log("Successfully grabbed userID:", row);
        console.log(row[0]);
        postID = row[0].postID;
        posterUserID = row[0].Users_UserID;

        updateClaimStatusBoardTable(postID);

        var postingTableUpdate = `UPDATE Posting SET claimStatus = 1 WHERE FoodItem_ItemID = ?`;
        connection.query(postingTableUpdate, [itemID], (error, updateResult, field) => {
          if (error) {
            //return error if updating the table fails
            console.log("Error updating claimed post: ", error);
          } else {
            // else return the updated table
            console.log("Successful claim update.");

            var usersTableQuery = "SELECT * FROM Users WHERE userID = ? LIMIT 1";
            connection.query(usersTableQuery, [posterUserID], (error, row, field) => {
              if (error) {
                //return error if selection fail
                console.log("Error grabbing user of claimed item: ", error);
              } else {
                //else return the
                console.log("Successfully grabbed user of claimed item. ", row);
                posterEmail = row[0].email;
                posterFirstName = row[0].firstName;
                console.log(posterEmail);
                // posterSuiteNumber = row[0].suiteNumber;
              }

              //sendClaimEmailToPoster(posterEmail, posterFirstName); //may also include: claimerEmail, claimerFirstName, claimerSuiteNumber 

              console.log(itemID);
              io.emit('claim return', (itemID));
            });
          }
        });
      }
    });
  });

});


/*************************************************************************
 * 
 *     MISCELLANEOUS FUNCTIONS USED IN FEATURES: CLAIM, LOAD, POST
 * 
 *************************************************************************/

function sendClaimEmailToPoster(posterEmail, posterFirstName) { //may also include: claimerEmail, claimerFirstName,
  //claimerSuiteNumber, postingFoodName, 
  //postingDescription, postingExpiryDate
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'de5kzppbkaumnfhu@ethereal.email',
      pass: 'wNmg25t9fqKXZ8wVUF'
    },
    // tls: {
    //     rejectUnauthorized:false
    // }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: posterEmail, // sender address
    to: posterEmail, // list of receivers
    subject: 'FoodBoard: Your food item has been claimed', // Subject line
    text: `Hello ${posterFirstName}, 
           Your neighbor _______ from Apartment Suite _______ has claimed your food item!
           Here's a reminder of what you posted on foodboard.ca.
           
           Food Name: 
           Food Description:
           Food Expiry:
  
           Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!`, // plain text body
    html: '' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occured sending claim email", error);
    } else {
      // Preview only available when sending through an Ethereal account

      // If successful, should print the following to the console:
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });
};

function deleteFoodItem(itemID) {
  var deletePost = `DELETE FROM FoodItem WHERE itemID = ? LIMIT 1`;
  connection.query(deletePost, [tempItemID], (error, row, field) => {
    if (error) {
      // return error if insertion fail
      console.log("Error occured when attempting to delete post: ", error);
    } else {
      // else return the updated table
      console.log("Successful deletion of claimed food item.");
    }
  });
};

function updateClaimStatusBoardTable(postID) {
  var boardTableUpdate = `UPDATE Board Set userPostClaimed = 1 WHERE Posting_PostID = ?`;
  connection.query(boardTableUpdate, [postID], (error, row, field) => {
    if (error) {
      //return error if update Board Table failed
      console.log("Error updating userPostClaimed status in Board Table: ", error);
    } else {
      // else return the updated table
      console.log("Successfully updated Board Table with userPostClaimed = 1", row);
    }
  });
};

function insertIntoPostingTable(itemID, userID) {
  var posting = "INSERT INTO Posting (FoodItem_ItemID, Users_UserID) VALUES (?, ?)";
  connection.query(posting, [itemID, userID], (error, result, field) => {
    if (error) {
      //return error if insertion into Posting Table fail
      console.log("Error inserting into Posting", error);
    } else {
      console.log("Successful insertion into Posting Table.", result);
    }
  });
};

/*************************************************************************
 * 
 *     MYSQL HANDLE DISCONNECT
 * 
 *************************************************************************/


// The port we are listening on
server.listen(port, () => {
  console.log(`We are on port ${port}`);
});

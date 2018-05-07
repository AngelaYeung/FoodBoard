const fs = require('fs');
const path = require('path');

/** Dependencies  */
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const siofu = require('socketio-file-upload'); // for image uploading

const port = 8080;

var app = express().use(siofu.router); // adds siofu as a router, middleware

// links express app the server; then links socketio to server
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { check, validationResult } = require('express-validator/check');

/* Parses the content-type that is transfered over HTTP */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


// sets root directory to current one
app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/" + 'home.html');
})

/**
 * Link to the boardpage on click of 'Board' button.
 */
app.get('/board', (req, res) => {
  res.sendFile(__dirname + "/" + 'boardpage.html');
});

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname + '/testindex.html'));
// });

var connection = mysql.createConnection({
  host: "localhost",
  database: "foodboard",
  user: "root",
  password: ""
});

connection.connect((error) => {
  //callback function
  if (error) {
    console.log('Error');
  } else {
    console.log('Connected');
  }
});

// /**
//  * Inserts the new registered user into the FoodBoard database, within the 'user' table.
//  */
// (function userRegistration() {
//   app.post('/user_registration_info', (req, resp) => {
//     connection.query("SELECT * FROM user", (error, rows, fields) => {
//       // If error connecting, throw error
//       if (error) {
//         console.log("Error in the query");
//       } else {
//         // store the input into variables
//         let firstName = req.body.register_first_name;
//         let lastName = req.body.register_last_name;
//         let email = req.body.register_email;
//         let suiteNumber = req.body.register_suite_number;
//         let password = req.body.register_pwd;
//         // else add a user to the database
//         var userRegistration = "INSERT INTO user(FirstName, LastName, Email, SuiteNumber, Password) VALUES(?, ?, ?, ?, ?)";
//         connection.query(userRegistration, [firstName, lastName, email, suiteNumber, password], (error) => {
//           if (error) {
//             // return error if insertion fail
//             console.log("Error inserting");
//             console.log(error);
//           } else {
//             // else return the updated table
//             console.log("Successful insert");
//           }
//         })
//       }
//       console.log(rows);
//     })
//   });
// })();

 /*************************************************************************
   * 
   *         FOOD BOARD REGISTRATION FEATURE - SERVER SIDE
   * 
   *************************************************************************/


  /** Handles 'post item' event that is fired from the home.html.  */
  app.post('/register', [

    // performs validation on received registration info

    check('pwd').custom((value,{req, location, path}) => {
      if (value !== req.body.confirmPwd) {
          // throw error if passwords do not match
          throw new Error("Passwords don't match");
      } else {
          return value;
      }
    })

    // check('firstName', "First name must be at least one character long.").isLength({min:1}),
    // check('lastName', "Last name must be at least one character long.").isLength({min:1}),
    // check('email').isEmail(),
    // check('suiteNumber').exists()
  ], (req, resp) => {

    // create constant to store the validation errors that may have occured
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation error occured: " + errors);
      resp.sendFile(__dirname + "/" + 'home.html');
      //resp.status(422).json(errors.mapped());
    } else {
      
      //If no validation errors occur, proceed to register user
      console.log("No validation errors occured.");

      // Stores user's registration info into variables
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let email = req.body.email;
      let suiteNumber = req.body.suiteNumber;
      let password = req.body.pwd;
      let confirmPassword = req.body.confirmPwd;

      // checks if user has already registered with provided email
      var checkRegistration = "SELECT * FROM User WHERE exists (select * from user where email = ?)";
      connection.query(checkRegistration, [email], (error, result) => {
        if (error) {
          //returns an error if error in query
          console.log("Registration error occured: " + error);
        } else if (result.length > 0) {
          //if registered email already exists, returns to the home.html (how to pass information back to home.html?)
          console.log("Registration unsuccessful, user already registered with this email: " + result);
          resp.sendFile(__dirname + "/" + 'home.html');
        } else {
          
          //else there were no users registered with the provided email, insert into User table
          var registerUser = "INSERT INTO User (firstName, lastName, email, suiteNumber, password) VALUES (?, ?, ?, ?, ?)";
          connection.query(registerUser, [firstName, lastName, email, suiteNumber, password], (error, success) => {
            if (error) {
              //return error if insertion fail
              console.log("Registration unsuccessful: " + error);
            } else {
              //else return the updated table
              console.log("Registration successful!: " + success);
              resp.sendFile(__dirname + "/" + 'boardpage.html');
            }
          });
        }
      });
    }

    
  });  
  

/**
 * Socketio detects that connection has been made to the server.
 * The connection event is fired, whenever anyone goes to foodboard.ca.
 */
io.on('connection', (socket) => {
  console.log('user connected');

  /** Initalizes the stockio-file-upload object */
  const uploader = new siofu();
  uploader.dir = path.join(__dirname, '/images'); // sets the upload directory
  uploader.listen(socket); // listens for image uploads

  
  /*************************************************************************
   * 
   *         FOOD BOARD LOAD FEATURE - SERVER SIDE
   * 
   * Fired as soon as user is connected to server
   * 
   *************************************************************************/


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
    console.log(item);

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
        id = rows.insertId
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
  });

});

// /** socket io to handle the connection event, and grabbing the table of all the foodboard
// post items */
// io.on('connection', function (socket) {
//   // grabs the actual foodboard postings
//   var foodBoardPostings = "SELECT * FROM posting";
//   connection.query(foodBoardPostings, (error, rows, field) => {
//     if (error) {
//       console.log("Error retrieving posts");
//     } else {
//       console.log("Successfully retrieved table.");
//       console.log(rows);
//     }
//   })

//   // grabs the actual food items
//   var foodboardItems = "SELECT * FROM fooditem";
//   connection.query(foodboardItems, (error, rows, fields) => {
//     if (error) {
//       console.log("Error grabbing food items");
//     } else {
//       console.log("Successfully grabbed food items.");
//       console.log(rows);
//     }
//   })
// });


// /** emit the food item information that was grabbed by the socket onto the HTML */
// io.on('connection', function (socket) {
//   console.log("Receiving the FoodBoard objects!");

//   let sql = "SELECT * FROM fooditem";
//   connection.query(sql, (error, rows, fields) => {
//     if (error) {
//       console.log("Failed receive from database\n");
//     } else {
//       console.log("Data received from database\n");
//       socket.emit('showrows', rows);
//     }
//   })
// });


// /**
//  * General delete function for a row in a database table.
//  */
// (function deleteRow() {
//   app.post('/delete-post', (req, resp) => {
//     // store the input into variables
//     let userPostID = 1;
//     // else add a user to the database
//     var postDelete = "DELETE FROM posting WHERE PostID = ?";
//     connection.query(postDelete, [userPostID], function (error, rows, field) {
//       if (error) {
//         // return error if insertion fail
//         console.log("Error deleting");
//       } else {
//         // else return the updated table
//         console.log("Successful deletion.  Rows removed: 1.");
//         console.log(rows);
//       }
//     });
//   });
// })();


// The port we are listening on
server.listen(port, () => {
  console.log(`We are on port ${port}`);
})
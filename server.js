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
var mysqlconnection = require('./app/public/js/mysqlconnection.js');

var connection = mysqlconnection.handleDisconnect();
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
    maxAge: 1800000,
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
// app.get('/', (req, res) => {
//   res.render('home.handlebars');
// });

app.get('/snake', (req, res) => {
  res.render('snake');
});

app.get('/boardpagero', (req, res) => {
  res.render('boardpagero');
});

app.get('/boardpagero_home', (req, res) => {
  res.render('boardpagero_home');
});

app.get('/', (req, res) => {

  var query = `SELECT sessionID, Users_userID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${req.sessionID}') LIMIT 1`;
  connection.query(query, (error, rows, fields) => {
    if (error) {
      console.log(new Date(Date.now()), 'Error:', error);
    } else {

      if (rows.length > 0) {
        res.render('home_success');
      } else {
        res.render('home');
      }
    }
  });

});

/*************************************************************************
 * 
 *         FOOD BOARD ACCOUNT SETTINGS FEATURE - SERVER SIDE
 * 
 * 
 *************************************************************************/
app.get('/account', (req, result) => {
  var sessionID = getSessionID('connect.sid');
  var query = `SELECT * FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${sessionID}') LIMIT 1`;
  connection.query(query, (error, rows, fields) => {
    if (error) {
      console.log(error);
    } else {

      if (rows.length) {
        var userID = rows[0].Users_userID;
        var itemID = claim.id;
        console.log('ClaimID:', itemID);
        console.log('Claim:', claim);
        //Query for user info for current user
        var userInfo = "SELECT * FROM Users WHERE userID = ?";
        connection.query(userInfo, [userID], (error, result, field) => {
          if (error) {
            console.log("error");
          } else {
            console.log("successful");
            var name = result[0].firstName + " " + result[0].lastName;
            var email = result[0].email;
            var suiteNum = result[0].suiteNumber;

            res.render('account', {
              name: name,
              email: email,
              suiteNum: suiteNum,
            });
          }
        });
      }
    }
    /*
    GET NAME, EMAIL, Suite #, current password
    */
  });
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

/*************************************************************************
  * 
  *         FOOD BOARD REGISTRATION FEATURE - SERVER SIDE
 
 
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
   *************************************************************************/


  /**
   * When the user has a complete loaded page, fetch data from db to print posts
   * to screen. 
   */
  socket.on('page loaded', (session) => {
    console.log('Server: page loaded')

    var query = `SELECT Users_userID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = ?) LIMIT 1`;
    connection.query(query, [session.sessionID], (error, rows, fields) => {
      if (error) {
        console.log(new Date(Date.now()), 'Error selecting sessionID in load feature: ', error);
      } else {
        if (rows.length) {

          // check to see if the user is an admin
          var userID = rows[0].Users_userID;
          var checkRole = "SELECT role FROM Users WHERE userID = ? LIMIT 1";
          connection.query(checkRole, [userID], (error, row, field) => {
            if (error) {
              console.log(new Date(Date.now()), "Error checking for role of user:", error);
            } else {
              var role = row[0].role;

              // load all posts to be filtered later in boardpage.js
              var allFoodboardItems = "SELECT * FROM FoodItem WHERE Users_claimerUserID IS NULL";
              connection.query(allFoodboardItems, (error, rows, fields) => {
                if (error) {
                  console.log(new Date(Date.now()), "Error grabbing food items");
                } else if (rows.length == 0) {
                  console.log("Database is empty.");
                } else {
                  console.log("Successfully grabbed food items.");
                  console.log(rows);

                  /* Sends list of food items to the client to print to browser */
                  socket.emit('load foodboard', {
                    rows: rows,
                    userID: userID,
                    role: role
                  });
                }
              });
            }
          });
        }
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
    var query = `SELECT sessionID, Users_userID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${item.sessionID}') LIMIT 1`;
    connection.query(query, (error, rows, fields) => {
      if (error) {
        console.log(new Date(Date.now()), "Error selecting sessionID in post feature", error);
      }

      if (rows.length) {

        let foodName = item.name;
        let foodDescription = item.description;
        let foodGroup = item.foodgrouping;
        let dateLocalTime = item.dateTime;
        let foodImage = item.image;
        let itemID;
        userID = rows[0].Users_userID;

        /** Inserts data into database */
        var foodItem = "INSERT INTO FoodItem (foodName, foodDescription, foodGroup,  foodExpiryTime, foodImage, Users_userID, Users_claimerUserID) VALUES (?, ?, ?, ?, ?, ?, ?)";
        connection.query(foodItem, [foodName, foodDescription, foodGroup, dateLocalTime, foodImage, userID, null], (error, rows, field) => {
          if (error) {
            // return error if insertion fail
            console.log(new Date(Date.now()), "Error inserting" + error);
            console.log(error);
          } else {
            // else return the updated table
            console.log("Successful insertion:");
            itemID = rows.insertId;
          }
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
            image: foodImage,
          });
        });
      } else {
        app.get('/nicetrybud');
      }
    });
  });

  /*************************************************************************
   * 
   *         FOOD BOARD DELETE FEATURE - SERVER SIDE
   * 
   *************************************************************************/
  socket.on('delete item', (deletion) => {
    console.log("Event Delete Item:", deletion);

    //Declaring variables needed to generate automated delete email
    let sessionID = deletion.sessionID;
    let itemID = deletion.id;
  
    let role
    let posterUserID, posterFirstName, posterSuiteNumber;
    let foodName, foodDescription, foodExpiryTime, foodImage;
    let claimerUserID, claimerEmail, claimerFirstName;

    // first check if the person deleting the post is currently in a session
    var query = `SELECT * FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = ?) LIMIT 1`;
    connection.query(query, [sessionID], (error, row, fields) => {
      if (error) {
        console.log(new Date(Date.now()), "Error occured while inquiring for sessionID", error);
      }
      if (row.length) {
        
        let posterUserID = row[0].Users_userID;
        
        // check to see if the user is an admin or poaster, no email is sent if a post is deleted by an admin
        var checkRole = "SELECT * FROM Users WHERE userID = ? LIMIT 1";
        connection.query(checkRole, [posterUserID], (error, row, field) => {
          if (error) {
            console.log(new Date(Date.now()), "Error checking for role of user:", error);
          } else {
            console.log("Successfully inquired for poster's information: ", row);
            role = row[0].role;
            posterFirstName = row[0].firstName;
            posterSuiteNumber = row[0].suiteNumber;

            if (role === 0) {

              // user is an admin, simply delete the post from all tables no email necessary
              deleteFoodItem(itemID);

              io.emit('delete return', (itemID));
            } else {

              // user is the poster of the food item
              // next query for the food item information as well as the claimerID if there is one.
              var queryFoodItemTable = "SELECT * FROM FoodItem WHERE itemID = ?";
              connection.query(queryFoodItemTable, [itemID], (error, row, field) => {
                if (error) {
                  console.log(new Date(Date.now()), "Error querying from FoodItem Table: ", error);
                } else {
                  console.log("Successfully obtained food item info from FoodItem Table");
                  foodName = row[0].foodName;
                  foodDescription = row[0].foodDescription;
                  foodExpiryTime = row[0].foodExpiryTime;
                  foodImage = row[0].foodImage;
                  claimerUserID = row[0].Users_claimerUserID;

                  // item can now be deleted from fooditem table, we have all relevant information
                  deleteFoodItem(itemID);

                  if (!claimerUserID) {

                    //posted food item has not been claimed by anyone, no email necessary
                    io.emit('delete return', (itemID));
                  } else {

                    // posted food item has been claimed
                    // query for claimer's information so we can send an automated email
                    var claimerQuery = "SELECT * FROM Users WHERE userID = ? LIMIT 1";
                    connection.query(claimerQuery, [claimerUserID], (error, row, field) => {
                      if (error) {
                        console.log(new Date(Date.now()), "Error checking for role of user:", error);
                      } else {
                        console.log("Successfully inquired for claimer's information.")
                        claimerEmail = row[0].email;
                        claimerFirstName = row[0].firstName;
                        claimerSuiteNumber = row[0].suiteNumber;

                        // sends an email to the claimer of the post 
                        sendDeleteEmailToClaimer(claimerEmail, claimerFirstName,
                          foodName, foodDescription, foodExpiryTime, foodImage,
                          posterFirstName, posterSuiteNumber);

                        io.emit('delete return', (itemID));
                      }
                    });
                  }
                }
              });
            }
          }
        });
      } 
    });
  });


  /*************************************************************************
   * 
   *         FOOD BOARD CLAIM FEATURE - SERVER SIDE
   * 
   *************************************************************************/


  socket.on('claim item', (claim) => {
    console.log('Event Claim Item:', claim);

    //Declaring variables needed to generate automated claim email
    let sessionID = claim.sessionID;
    let itemID = claim.id;

    let role
    let posterUserID, posterEmail, posterFirstName;
    let foodName, foodDescription, foodExpiryTime, foodImage;
    let claimerUserID, claimerEmail, claimerFirstName, claimerSuiteNumber;

    var query = `SELECT * FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = ?) LIMIT 1`;
    connection.query(query, [sessionID], (error, row, fields) => {
      if (error) {
        console.log(new Date(Date.now()), "Error occured while inquiring for sessionID", error);
      }

      if (row.length) {

        claimerUserID = row[0].Users_userID;

        var setClaimerID = `UPDATE FoodItem SET Users_claimerUserID = ? WHERE itemID = ?`;
        connection.query(setClaimerID, [claimerUserID, itemID], (error, row, field) => {
          if (error) {
            //return error if update claimerID into failed
            console.log(new Date(Date.now()), "Error updating claimerID into FoodItem table: ", error);
          } else {
            // else return the updated table
            console.log("Successfully updated claimerID into FoodItem table.");

            var queryFoodItemTable = "SELECT * FROM FoodItem WHERE itemID = ?";
            connection.query(queryFoodItemTable, [itemID], (error, row, field) => {
              if (error) {
                //error occured while attempting to query FoodItem Table
                console.log(new Date(Date.now()), "Error querying from FoodItem Table", error);
              } else {
                console.log("Successfully obtained Poster's userID from FoodItem Table", row);
                posterUserID = row[0].Users_userID;
                foodName = row[0].foodName;
                foodDescription = row[0].foodDescription;
                foodExpiryTime = row[0].foodExpiryTime;
                foodImage = row[0].foodImage;

                var usersTableQuery = "SELECT * FROM Users WHERE userID = ? OR userID = ? LIMIT 2";
                connection.query(usersTableQuery, [posterUserID, claimerUserID], (error, row, field) => {
                  if (error) {
                    //return error if selection fail
                    console.log(new Date(Date.now()), "Error grabbing user of claimed item: ", error);
                  } else {
                    //else return the users information
                    console.log("Successfully grabbed user of claimed item. ", row);
                    posterEmail = row[0].email;
                    posterFirstName = row[0].firstName;
                    claimerEmail = row[1].email;
                    claimerFirstName = row[1].firstName;
                    claimerSuiteNumber = row[1].suiteNumber;

                    sendClaimEmailToPoster(posterEmail, posterFirstName,
                      foodName, foodDescription, foodExpiryTime, foodImage,
                      claimerEmail, claimerFirstName, claimerSuiteNumber);

                    console.log(itemID);
                    io.emit('claim return', (itemID));
                  }
                });
              }
            });
          }
        });
      } else {
        app.get('/nicetrybud');
      }
    });
  });
});


/*************************************************************************
 * 
 *     MISCELLANEOUS FUNCTIONS USED IN FEATURES: DELETE, CLAIM
 * 
 *************************************************************************/
function sendDeleteEmailToClaimer(claimerEmail, claimerFirstName, foodName, foodDescription, foodExpiryTime, foodImage, posterEmail, posterFirstName, posterSuiteNumber) {
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
    from: claimerEmail, // sender address
    to: claimerEmail, // list of receivers
    subject: 'FoodBoard: The food item you claimed is no longer available.', // Subject line
    text: `Hello ${claimerFirstName},

    Unfortunately, your neighbor ${posterFirstName} from Apartment Suite ${posterSuiteNumber} has deleted their posted food item.
    Here's a reminder of what their post looked like.
           
    Food Name: ${foodName}
    Food Description: ${foodDescription}
    Food Expiry: ${foodExpiryTime}
    
    Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!`, // plain text body
    html: `Hello ${claimerFirstName},<br/>
    <br/>
    Unfortunately, your neighbor ${posterFirstName} from Apartment Suite ${posterSuiteNumber} has deleted their posted food item.<br/>
    Here's a reminder of what their post looked like.<br/>
    <br/>
    Food Name: ${foodName}<br/>
    Food Description: ${foodDescription}<br/>
    Food Expiry: ${foodExpiryTime}<br/>
    Food Image: <br/>
    <br/>
    <img src="cid:donotreply@foodboard.ca"/><br/>
    <br/>
    Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!`, // html body
    attachments: [{
      filename: `foodboard_${foodImage}`,
      path: `./app/images/${foodImage}`,
      cid: 'donotreply@foodboard.ca'
    }]
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occured sending delete email", error);
    } else {
      // Preview only available when sending through an Ethereal account

      // If successful, should print the following to the console:
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      console.log('Delete message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });
}

function sendClaimEmailToPoster(posterEmail, posterFirstName, foodName, foodDescription, foodExpiryTime, foodImage, claimerEmail, claimerFirstName, claimerSuiteNumber) { //may also include: claimerEmail, claimerFirstName,
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

    Your neighbor ${claimerFirstName} from Apartment Suite ${claimerSuiteNumber} has claimed your food item! You can 
    let ${claimerFirstName} know what time is best to pick up your food item by contacting him or her at ${claimerEmail}.

    Here's a reminder of what you posted on foodboard.ca.
           
    Food Name: ${foodName}
    Food Description: ${foodDescription}
    Food Expiry: ${foodExpiryTime}
    
    Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!`, // plain text body
    html: `<p>Hello ${posterFirstName},<br/>
    <br/>
    Your neighbor ${claimerFirstName} from Apartment Suite ${claimerSuiteNumber} has claimed your food item! You can 
    let ${claimerFirstName} know what time is best to pick up your food item by contacting him or her at ${claimerEmail}.<br/>
    <br/>
    Here's a reminder of what you posted on foodboard.ca.<br/>
    <br/>
    Food Name: ${foodName}<br/>
    Food Description: ${foodDescription}<br/>
    Food Expiry: ${foodExpiryTime}<br/>
    Food Image: <br/>
    <br/>
    <img src="cid:donotreply@foodboard.ca"/><br/>
    <br/>
    Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!`, // html body
    attachments: [{
      filename: `foodboard_${foodImage}`,
      path: `./app/images/${foodImage}`,
      cid: 'donotreply@foodboard.ca'
    }]
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
      console.log('Claim message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });
};

function deleteFoodItem(itemID) {
  var deletePost = `DELETE FROM FoodItem WHERE itemID = ? LIMIT 1`;
  connection.query(deletePost, [itemID], (error, row, field) => {
    if (error) {
      // return error if insertion fail
      console.log("Error occured when attempting to delete post: ", error);
    } else {
      // else return the updated table
      console.log("Successful deletion of claimed food item.");
    }
  });
};

function deleteFromClaimedPosts(itemID) {
  var deleteFromClaimedPostsTable = "DELETE FROM ClaimedPosts WHERE FoodItem_itemID = ? LIMIT 1";
  connection.query(deleteFromClaimedPostsTable, [itemID], (error, row, field) => {
    if (error) {
      console.log("Error occured when attempting to delete from ClaimedPosts table: ", error);
    } else {
      console.log("Successful deletion from ClaimedPosts table.")
    }
  });
}


/*************************************************************************
 * 
 *     MYSQL HANDLE DISCONNECT
 * 
 *************************************************************************/


// The port we are listening on
server.listen(port, () => {
  console.log(`We are on port ${port}`);
});

function getSessionID(clientSessionID) {
  var query = 'SELECT sessionID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = ?)';
  var sessionID = connection.query(query, [clientSessionID], (error, rows, fields) => {
    if (error) {
      console.log('Error', error)
    } else {
      if (rows.length) {
        console.log('QUERY TRUE');
        return true;
      } else {
        console.log('QUERY FALSE');
        return false;
      }
    }
  });

  return sessionID;
};
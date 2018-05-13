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
  socket.on('page loaded', (session) => {
    console.log('Server: page loaded')
    /** Grab All Food Items from DB */

    // SESSION ID CHECK: GET USER ID
    // WITH USER ID GET ROLE
    // ROLE TELLS U WHAT TO LOAD
    //    if else role = admin render everything 
    //    else render delete button for only your posts run (checkOwnerPost)

    // select all items from fooditem
    // 

    var query = `SELECT Users_userID FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = ?) LIMIT 1`;
    connection.query(query, [session.sessionID], (error, rows, fields) => {
      if (error) {
        console.log(date.now(), 'Error', error);
      } else {
        if (rows.length) {

          var userID = rows[0].Users_userID;

          var foodboardItems = "SELECT * FROM FoodItem WHERE claimStatus = 0";
          connection.query(foodboardItems, (error, rows, fields) => {
            if (error) {
              console.log("Error grabbing food items");
            } else if (!rows.length) {
              console.log("Database is empty.");
            } else {
              console.log("Successfully grabbed food items.");
              console.log(rows);

              /* Sends list of food items to the client to print to browser */
              socket.emit('load foodboard', {
                rows: rows,
                userID: userID,
              });
            }
          });
        } else {
          console.log("nice try bud");

          var foodboardItems = "SELECT * FROM FoodItem WHERE claimStatus = 0";
          connection.query(foodboardItems, (error, rows, fields) => {
            if (error) {
              console.log("Error grabbing food items");
            } else if (!rows.length) {
              console.log("Database is empty.");
            } else {
              console.log("Successfully grabbed food items.");
              console.log(rows);

              socket.emit('load foodboardro', rows);
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
        console.log(error);
      }

      console.log("this is length of rows:", rows.length);
      if (rows.length) {

        let foodName = item.name;
        let foodDescription = item.description;
        let foodGroup = item.foodgrouping;
        let dateLocalTime = item.dateTime;
        let foodImage = item.image;
        let itemID;
        userID = rows[0].Users_userID;

        /** Inserts data into database */
        var foodItem = "INSERT INTO FoodItem (foodName, foodDescription, foodGroup,  foodExpiryTime, foodImage, Users_userID) VALUES (?, ?, ?, ?, ?, ?)";
        connection.query(foodItem, [foodName, foodDescription, foodGroup, dateLocalTime, foodImage, userID], (error, rows, field) => {
          if (error) {
            // return error if insertion fail
            console.log("Error inserting" + error);
            console.log(error);
          } else {
            // else return the updated table
            console.log("Successful insertion:", rows);
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

    //Declaring variables needed to generate automated delete email
    var sessionID = deletion.sessionID;
    var itemID = deletion.id;

    var posterUserID;
    var posterFirstName;
    var posterSuiteNumber;

    var foodName;
    var foodDescription;
    var foodExpiryTime;
    var foodImage;

    var claimerUserID;
    var claimerEmail;
    var claimerFirstName;

    // first check if the person deleting the post is currently in a session
    var query = `SELECT * FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = ?) LIMIT 1`;
    connection.query(query, [sessionID], (error, rows, fields) => {
      if (error) {
        console.log(error);
      }
      // if poster is currently in a session, continue with deletion of the post
      if (rows.length) {
        posterUserID = rows[0].Users_userID;

        // then check if we are deleting a claimed post. This will tell us if we need to send an automated email to the claimer
        var selectClaimStatus = "SELECT * FROM ClaimedPosts WHERE FoodItem_itemID = ? LIMIT 1";
        connection.query(selectClaimStatus, [itemID], (error, row, field) => {
          if (error) {
            console.log("Error occured when attempting to query ClaimedPosts Table: ", error);
          } else {
            console.log("Successful query of claimedPosts Table.");
            if (row.length) {
              claimerUserID = rows[0].Sessions_Users_userID;

              // post has been claimed, query for post information before deleting post from FoodItem table
              var queryFoodItemTable = "SELECT * FROM FoodItem WHERE itemID = ?";
              connection.query(queryFoodItemTable, [itemID], (error, row, field) => {
                if (error) {
                  console.log("Error querying from FoodItem Table to get ");
                } else {
                  console.log("Successfully obtained Poster's userID from FoodItem Table", row);
                  foodName = row[0].foodName;
                  foodDescription = row[0].foodDescription;
                  foodExpiryTime = row[0].foodExpiryTime;
                  foodImage = row[0].foodImage;

                  // delete the post from all tables
                  deleteFromClaimedPosts(itemID);
                  deleteFoodItem(itemID);

                  // query for the first name and email of person who claimed post
                  var queryUserTable = "SELECT * FROM Users WHERE userID = ? OR userID = ? LIMIT 2";
                  connection.query(query, [claimerUserID, posterUserID], (error, row, field) => {
                    if (error) {
                      console.log("Error occured when attempting to query for claimer's information.", error);
                    } else {
                      console.log("Successful query of claimer's information.");
                      claimerEmail = row[0].email;
                      claimerFirstName = row[0].firstName;
                      posterFirstName = row[1].firstName;
                      posterSuiteNumber = row[1].suiteNumber;

                      // sends an email to the claimer of the post 
                      sendDeleteEmailToClaimer(claimerEmail, claimerFirstName,
                        foodName, foodDescription, foodExpiryTime, foodImage,
                        posterFirstName, posterSuiteNumber);

                      io.emit('delete return', (itemID));
                    }
                  });
                }
              });
            } else {
              //post has not been claimed by anyone, only deletion is necessary
              console.log("The posted food item has not been claimed and can be deleted.");
              deleteFoodItem(itemID);

              io.emit('delete return', (itemID));
            }
          }
        });
      } else {
        // user is not currently in a session and therefore should'nt be able to delete a post
        app.get('/nicetrybud');
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
    var sessionID = claim.sessionID;
    var itemID = claim.id;

    var posterUserID;
    var posterEmail;
    var posterFirstName;

    var foodName;
    var foodDescription;
    var foodExpiryTime;
    var foodImage;

    var claimerUserID;
    var claimerEmail;
    var claimerFirstName;
    var claimerSuiteNumber;

    var query = `SELECT * FROM Sessions WHERE exists (SELECT * from Sessions where sessionID = '${sessionID}') LIMIT 1`;
    connection.query(query, (error, rows, fields) => {
      if (error) {
        console.log(error);
      }

      if (rows.length) {
        claimerUserID = rows[0].Users_userID;
        var itemID = claim.id;
        console.log('ClaimID:', itemID);
        console.log('Claim:', claim);

        var foodItemTableUpdate = `UPDATE FoodItem Set claimStatus = 1 WHERE itemID = ?`;
        connection.query(foodItemTableUpdate, [itemID], (error, row, field) => {
          if (error) {
            //return error if update Board Table failed
            console.log("Error updating claimStatus in FoodItem table: ", error);
          } else {
            // else return the updated table
            console.log("Successfully claimStatus in FoodItem table to 1", row);
          }
        });

        var queryFoodItemTable = "SELECT * FROM FoodItem WHERE itemID = ?";
        connection.query(queryFoodItemTable, [itemID], (error, row, field) => {
          if (error) {
            //error occured while attempting to query FoodItem Table
            console.log("Error querying from FoodItem Table to get ");
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
                console.log("Error grabbing user of claimed item: ", error);
              } else {
                //else return the users information
                console.log("Successfully grabbed user of claimed item. ", row);
                posterEmail = row[0].email;
                posterFirstName = row[0].firstName;
                claimerEmail = row[1].email;
                claimerFirstName = row[1].firstName;
                claimerSuiteNumber = row[1].suiteNumber;

                var insertIntoClaimedTable = `INSERT INTO ClaimedPosts (FoodItem_itemID, FoodItem_Users_userID, Sessions_Users_userID) VALUES (?, ?, ?)`;
                connection.query(insertIntoClaimedTable, [itemID, posterUserID, claimerUserID], (error, result, field) => {
                  if (error) {
                    //return error if insertion into claimed posts table fails
                    console.log("Error inserting into ClaimedPosts table: ", error);
                  } else {
                    // else successful insertion into claimed posts table
                    console.log("Successful insertion into claimed posts table. ", result);
                  }
                });

                sendClaimEmailToPoster(posterEmail, posterFirstName,
                  foodName, foodDescription, foodExpiryTime, foodImage,
                  claimerEmail, claimerFirstName, claimerSuiteNumber);

                console.log(itemID);
                io.emit('claim return', (itemID));
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
}
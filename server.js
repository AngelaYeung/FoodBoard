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
const nodemailer = require('nodemailer'); //for sending automated emails

const inlineCss = require('nodemailer-juice'); // allows for inline css styling in nodemailer email

/** Exports made */
var models = require("./app/models"); // tells the server to require these routes 
var authRoute = require('./app/routes/auth.js');
var mysqlconnection = require('./app/public/js/mysqlconnection.js');
var bCrypt = require('bcrypt-nodejs'); // decrypting/encrypting passwords server side
var slacklog = require('./app/public/js/slacklogs');
var slackcmd = require('./app/public/js/slackcommands');

const port = 8080;

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


app.get('/snake', (req, res) => {
  res.render('snake');
});

app.get('/', (req, res) => {

  var query = `SELECT * FROM Sessions WHERE sessionID = '${req.sessionID}' LIMIT 1`;
  mysqlconnection.pool.query(query, (error, rows, fields) => {
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
})


app.get('/nicetrybud', (req, res) => {

  var query = `SELECT * FROM Sessions WHERE sessionID = '${req.sessionID}' LIMIT 1`;
  mysqlconnection.pool.query(query, (error, rows, fields) => {
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
})


app.post('/slack/command/items', (req, res) => {

  if (req.body.token === slackcmd.token) {
    slackcmd.getItems(req, res);
  } else {
    slacklog.log('Error: Slack requesting new items-  Incorrect Slack token', '');
    console.log('Incorrect slack token');
  }

});


app.post('/slack/command/sessions', (req, res) => {
  slacklog.log('Slack requesting sessions from db:', '');

  if (req.body.token === slackcmd.token) {
    slackcmd.getSessions(req, res);
  } else {
    slacklog.log('Error: Slack requesting sessions -  Incorrect Slack token', '');
    console.log('Incorrect slack token');
  }

});


app.post('/slack/command/users', (req, res) => {
  slacklog.log('Slack requesting sessions from db:', '');

  if (req.body.token === slackcmd.token) {
    slackcmd.getUsers(req, res);
  } else {
    slacklog.log('Error: Slack requesting users -  Incorrect Slack token', '');
    console.log('Incorrect slack token');
  }

});




/*************************************************************************
 * 
 *         FOOD BOARD ACCOUNT PAGE FEATURE - SERVER SIDE
 * 
 *************************************************************************/
app.get('/account', (req, res) => {
  var sessionID = req.sessionID;

  var query = `SELECT * FROM Sessions WHERE sessionID = '${sessionID}' LIMIT 1`;
  mysqlconnection.pool.query(query, (error, rows, fields) => {
    if (error) {
      console.log(new Date(Date.now()), 'Error grabbing userID from Sessions table: ', error);
    } else {

      if (rows.length) {
        var userID = rows[0].Users_userID;
        //Query for user info for current user
        var userInfo = "SELECT * FROM users WHERE userID = ?";
        mysqlconnection.pool.query(userInfo, [userID], (error, rows, field) => {
          if (error) {
            console.log(new Date(Date.now()), "Error querying for user information for account settings feature.");
          } else {
            console.log("Successful query for user information in account settings feature.");
            var name = rows[0].firstName + " " + rows[0].lastName;
            var email = rows[0].email;
            var suiteNum = rows[0].suiteNumber;

            res.render('account', {
              name: name,
              email: email,
              suiteNum: suiteNum,
            });
          }
        });
      }
    }
  });

});

/*************************************************************************
 * 
 *         FOOD BOARD VERIFY AND CHANGE PASSWORD COMBINED - SERVER SIDE
 * 
 *************************************************************************/
app.post('/changepassword', (req, res) => {

  let sessionID = req.sessionID;
  let passwordNotHashed = req.body.currentPW;
  let userID;
  let passwordHashed;
  let newPassword;
  let name;
  let email;
  let suiteNumber;


  // first check if the user is in a session
  var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
  mysqlconnection.pool.query(query, [sessionID], (error, rows, fields) => {
    if (error) {
      console.log(new Date(Date.now()), 'Error grabbing userID from Sessions table: ', error);

    } else {
      console.log("Successfully queried for userID.");
      if (rows.length) {
        userID = rows[0].Users_userID;

        // the user is confirmed to be in a session, now grab the old password tied to the user ID from the database
        var verifyOldPassword = "SELECT * FROM users WHERE userID = ?";
        mysqlconnection.pool.query(verifyOldPassword, [userID], (error, rows, field) => {
          if (error) {
            console.log(new Date(Date.now()), "Error querying for old password in the Users Table: ", error);

          } else if (rows.length) {

            passwordHashed = rows[0].password;
            name = rows[0].firstName + " " + rows[0].lastName;
            email = rows[0].email;
            suiteNumber = rows[0].suiteNumber;
            // the old password was contained in the database, now verify the old password matches the hashed password contained in the database
            var isValidPassword = (formalHashed, formalNotHashed) => {
              return bCrypt.compareSync(formalNotHashed, formalHashed);
            }
            // function compares the password to determine if they match
            if (!isValidPassword(passwordHashed, passwordNotHashed)) {
              // the call back function can send data back to auth.js
              res.render('account', {
                passwordMessage: "Not a valid password", //renders an invalid password message using handlebars onto account page
                name: name,
                email: email,
                suiteNum: suiteNumber
              });

            } else {

              // the password is valid and matches what was found in the database, continue with changing the password
              var generateHash = (password) => {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
              };
              newPassword = generateHash(req.body.newPW); // hashed password

              // updates the old password with the new password in the Users table
              queryChangePassword = "UPDATE users SET password = ? WHERE userID = ?";
              mysqlconnection.pool.query(queryChangePassword, [newPassword, userID], (error, rows, field) => {
                if (error) {
                  console.log(new Date(Date.now()), "Error occured while trying to change password:", error);

                } else {
                  console.log("Successfully changed password.");

                  res.render('account', {
                    passwordMessage: "Your password has been changed!",
                    name: name,
                    email: email,
                    suiteNum: suiteNumber
                  });

                }
              });
            }
          }
        });
      }
    }
  });

});

/*************************************************************************
 * 
 *         FOOD BOARD VERIFY PASSWORD/CHANGE SUITE NUMBER COMBINED - SERVER SIDE
 * 
 *************************************************************************/

app.post("/changesuitenumber", (req, res) => {

  let sessionID = req.sessionID;
  let newSuiteNumber = req.body.newSuite;
  let passwordNotHashed = req.body.currentPW;
  let userID;
  let passwordHashed;
  let name;
  let email;
  let oldSuiteNumber;

  console.log("Session ID: ", sessionID);
  // first check if the user is in a session


  var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
  mysqlconnection.pool.query(query, [sessionID], (error, rows, fields) => {
    if (error) {
      console.log(new Date(Date.now()), 'Error grabbing userID from Sessions table: ', error);

    } else if (rows.length) {
      userID = rows[0].Users_userID;

      // the user is confirmed to be in a session, now grab the old password tied to the userID from the database
      var verifyOldPassword = "SELECT * FROM users WHERE userID = ?";
      mysqlconnection.pool.query(verifyOldPassword, [userID], (error, rows, field) => {
        if (error) {
          console.log(new Date(Date.now()), "Error querying for old password in the users Table: ", error);
        } else {
          if (rows.length) {

            passwordHashed = rows[0].password;
            name = rows[0].firstName + " " + rows[0].lastName;
            email = rows[0].email;
            oldSuiteNumber = rows[0].suiteNumber;
            // the old password was contained in the database, now verify the old password matches the hashed password contained in the database
            var isValidPassword = (formalHashed, formalNotHashed) => {
              return bCrypt.compareSync(formalNotHashed, formalHashed);
            }

            // function compares the password to determine if they match
            if (!isValidPassword(passwordHashed, passwordNotHashed)) {
              // the call back function can send data back to auth.js
              res.render('account', {
                suiteMessage: "Not a valid password", //renders an invalid password message using handlebars onto account page
                suiteNum: oldSuiteNumber,
                name: name,
                email: email
              });

            } else {

              // updates the suite number with the new suite number in the users table
              queryChangeEmail = "UPDATE users SET suiteNumber = ? WHERE userID = ?";
              mysqlconnection.pool.query(queryChangeEmail, [newSuiteNumber, userID], (error, rows, field) => {
                if (error) {
                  console.log(new Date(Date.now()), "Error occured while trying to change suiteNumber:", error);

                } else {
                  console.log("Successfully changed suite number.");

                  res.render('account', {
                    suiteMessage: "Your suite number has been changed!",
                    suiteNum: newSuiteNumber,
                    name: name,
                    email: email
                  });

                }
              });
            }
          }
        }
      });
    }
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
  *
/*************************************************************************
* Socketio detects that connection has been made to the server.
* The connection event is fired, whenever anyone goes to foodboard.ca.
*/
io.on('connection', (socket) => {

  /** Initalizes the stockio-file-upload object */
  const uploader = new siofu();
  uploader.dir = path.join(__dirname, '/app/images'); // sets the upload directory
  uploader.listen(socket); // listens for image uploads


  /**
   * Logs the number of open sessions to slack.
   */

  var query = `SELECT * FROM Sessions`;
  mysqlconnection.pool.query(query, (error, rows, fields) => {
    if (error) {
      slacklog.log(`Event: Connection ${query}.`, error);
      console.log(new Date(Date.now()), 'Connection: ', error);
    } else {
      slacklog.log('Number of active sessions', rows.length);
    }
  });


  /*************************************************************************
   * 
   *         FOOD BOARD LOAD FEATURE - SERVER SIDE
   * 
   * Fired as soon as user is connected to server
   * 
   *************************************************************************
 
  /**
   * When the user has a complete loaded page, fetch data from db to print posts
   * to screen. 
   */

  socket.on('page loaded', (session) => {
    var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
    mysqlconnection.pool.query(query, [session.sessionID], (error, rows, fields) => {
      if (error) {
        slacklog.log(`Event: Page loaded ${query}.`, error);
        console.log(new Date(Date.now()), 'Error selecting sessionID in load feature: ', error);
      } else {
        if (rows.length) {
          // check to see if the user is an admin
          var userID = rows[0].Users_userID;

          // deletes expired food items from FoodItem table before loading
          console.log("LOAD FUNCTION: THE CURRENT TIME NOW IS:", new Date(Date.now()));

          // emit the deleted rows to myClaims, myPosts, boardpage
          emitDeletedRows = "SELECT itemID from FoodItem where foodExpiryTime < ?";
          mysqlconnection.pool.query(emitDeletedRows, [new Date(Date.now())], (error, rows, field) => {
            console.log(rows);
            if (error) {
              slacklog.log(`Event: Delete expired food items. ${emitDeletedRows}.`, error);
              console.log(new Date(Date.now()), "Error occured when attempting to select expired food items: ", error);
            }
            else if (rows.length == 0) {
              console.log("There are no expired food items to delete at this time: ", new Date(Date.now()));
              console.log(rows.length)
            } else {
              io.emit('delete expired posts', {
                rows: rows
              });

              deleteExpiredItems = "DELETE FROM FoodItem WHERE foodExpiryTime < ?";
              mysqlconnection.pool.query(deleteExpiredItems, [new Date(Date.now())], (error, rows, field) => {
                console.log("CHANGED ROWS: ", rows.changedRows);
                if (error) {
                  // return error if deletion fail
                  slacklog.log(`Event: Delete expired food items. ${deleteExpiredItems}.`, error);
                  console.log(new Date(Date.now()), "Error occured when attempting to delete expired food items: ", error);
                } else if (rows.affectedRows == 0) {
                  console.log("There are no expired food items to delete at this time: ", new Date(Date.now()));
                  console.log(rows.length)
                } else {
                  console.log("Successful deletion of expired food items.");
                }
              });
            }
          });

          var checkRole = "SELECT role FROM users WHERE userID = ? LIMIT 1";
          mysqlconnection.pool.query(checkRole, [userID], (error, rows, field) => {
            if (error) {
              slacklog.log(`Event: Page loaded ${checkRole}.`, error);
              console.log(new Date(Date.now()), "Error checking for role of user:", error);

            } else {
              var role = rows[0].role;
              // load all posts to be filtered later in boardpage.js
              var allFoodboardItems = "SELECT * FROM FoodItem WHERE Users_claimerUserID IS NULL AND foodExpiryTime > ?";
              mysqlconnection.pool.query(allFoodboardItems, [new Date(Date.now())], (error, rows, fields) => {
                if (error) {
                  slacklog.log(`Event: Page loaded ${allFoodboardItems}.`, error);
                  console.log(new Date(Date.now()), "Error grabbing food items");

                } else if (rows.length == 0) {
                  console.log("Database is empty.");
                  socket.emit('empty foodboard');
                } else {
                  console.log("Successfully grabbed food items.");

                  var sessionID = session.sessionID;
                  /* Sends list of food items to the client to print to browser */
                  socket.emit('load foodboard', {
                    rows: rows,
                    userID: userID,
                    sessionID: sessionID,
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
   *         FOOD BOARD MYPOSTS FEATURE - SERVER SIDE
   * 
   * 
   *************************************************************************/
  socket.on('my posts', (session) => {



    var query = `SELECT * FROM Sessions WHERE sessionID = '${session.sessionID}' LIMIT 1`;
    mysqlconnection.pool.query(query, (error, rows, fields) => {
      if (error) {
        slacklog.log(`Event: My posts ${query}.`, error);
        console.log(new Date(Date.now()), "Error selecting sessionID in 'myposts' feature:", error);

      } else {
        if (rows.length) {
          var userID = rows[0].Users_userID;
          //Query for user info for current user
          var userInfo = "SELECT * FROM FoodItem WHERE Users_userID = ?";
          mysqlconnection.pool.query(userInfo, [userID], (error, rows, fields) => {
            if (error) {
              slacklog.log(`Event: My posts. ${userInfo}.`, error);
              console.log(new Date(Date.now()), "Error selecting User's posts in 'myposts' feature:", error);
            } else if (rows.length == 0) {
              console.log("This user has no posts to load in 'myposts' page.");
              //TODO generate some kind of user prompt
            } else {
              console.log("Successfully loading the users posts.");
              socket.emit('load my posts', {
                rows: rows,
                userID: userID,
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

    var query = `SELECT sessionID, Users_userID FROM Sessions WHERE sessionID = '${item.sessionID}' LIMIT 1`;
    mysqlconnection.pool.query(query, (error, rows, fields) => {
      if (error) {
        slacklog.log(`Event: Post item ${query}.`, error);
        console.log(new Date(Date.now()), "Error selecting sessionID in post feature", error);

      } else if (rows.length) {

        let foodName = item.name;
        let foodDescription = item.description;
        let foodGroup = item.foodgrouping;
        let dateLocalTime = item.dateTime;
        let foodImage = item.image;
        let itemID;
        let sessionID = item.sessionID;
        userID = rows[0].Users_userID;

        /** Inserts data into database */
        var foodItem = "INSERT INTO FoodItem (foodName, foodDescription, foodGroup,  foodExpiryTime, foodImage, Users_userID, Users_claimerUserID) VALUES (?, ?, ?, ?, ?, ?, ?)";
        mysqlconnection.pool.query(foodItem, [foodName, foodDescription, foodGroup, dateLocalTime, foodImage, userID, null], (error, rows, field) => {
          if (error) {
            // return error if insertion fail
            slacklog.log(`Event: Post item ${foodItem}.`, error);
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
          slacklog.log('Item being posted: ', {
            sessionID: sessionID,
            id: itemID,
            name: foodName,
            description: foodDescription,
            dateTime: dateLocalTime,
            foodgrouping: foodGroup,
            image: foodImage,
          });

          io.emit('post item return', {
            sessionID: sessionID,
            id: itemID,
            name: foodName,
            description: foodDescription,
            dateTime: dateLocalTime,
            foodgrouping: foodGroup,
            image: foodImage,
          });
        });
      } else {
        slacklog.log('NICE TRY BUD!', '');
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
    let sessionID = deletion.sessionID;
    let itemID = deletion.id;

    let role
    let posterUserID, posterFirstName, posterSuiteNumber;
    let foodName, foodDescription, foodExpiryTime, foodImage;
    let claimerUserID, claimerEmail, claimerFirstName;

    // first check if the person deleting the post is currently in a session
    var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
    mysqlconnection.pool.query(query, [sessionID], (error, rows, fields) => {
      if (error) {
        slacklog.log(`Event: Delete item. ${query}.`, error);
        console.log(new Date(Date.now()), "Error occured while inquiring for sessionID", error);

      } else if (rows.length) {

        let posterUserID = rows[0].Users_userID;

        // check to see if the user is an admin or poaster, no email is sent if a post is deleted by an admin
        var checkRole = "SELECT * FROM users WHERE userID = ? LIMIT 1";
        mysqlconnection.pool.query(checkRole, [posterUserID], (error, rows, field) => {
          if (error) {
            console.log(new Date(Date.now()), "Error checking for role of user:", error);

          } else {
            slacklog.log(`Event: Delete item. ${checkRole}.`, error);
            console.log("Successfully inquired for poster's information: ", rows);
            role = rows[0].role;
            posterFirstName = rows[0].firstName;
            posterSuiteNumber = rows[0].suiteNumber;

            if (role === 0) {

              // user is an admin, simply delete the post from all tables no email necessary
              deleteFoodItem(itemID);

              io.emit('delete return', (itemID));
            } else {

              // user is the poster of the food item
              // next query for the food item information as well as the claimerID if there is one.
              var queryFoodItemTable = "SELECT * FROM FoodItem WHERE itemID = ?";
              mysqlconnection.pool.query(queryFoodItemTable, [itemID], (error, rows, field) => {
                if (error) {
                  slacklog.log(`Event: Delete item. ${queryFoodItemTable}.`, error);
                  console.log(new Date(Date.now()), "Error querying from FoodItem Table: ", error);

                } else {
                  try {
                    console.log("Successfully obtained food item info from FoodItem Table");
                    foodName = rows[0].foodName;
                    foodDescription = rows[0].foodDescription;
                    foodExpiryTime = rows[0].foodExpiryTime;
                    foodImage = rows[0].foodImage;
                    claimerUserID = rows[0].Users_claimerUserID;

                    // item can now be deleted from fooditem table, we have all relevant information
                    deleteFoodItem(itemID);

                    if (!claimerUserID) {
                      console.log("TEST DELETE: claimerUSERID doesnt exist!");
                      //posted food item has not been claimed by anyone, no email necessary
                      io.emit('delete return', (itemID));

                    } else {

                      // posted food item has been claimed
                      // query for claimer's information so we can send an automated email
                      var claimerQuery = "SELECT * FROM users WHERE userID = ? LIMIT 1";
                      mysqlconnection.pool.query(claimerQuery, [claimerUserID], (error, rows, field) => {
                        if (error) {
                          slacklog.log(`Event: Delete item. ${claimerQuery}.`, error);
                          console.log(new Date(Date.now()), "Error checking for role of user:", error);
                        } else {
                          console.log("Successfully inquired for claimer's information.")
                          claimerEmail = rows[0].email;
                          claimerFirstName = rows[0].firstName;
                          claimerSuiteNumber = rows[0].suiteNumber;

                          // sends an email to the claimer of the post 
                          sendDeleteEmailToClaimer(claimerEmail, claimerFirstName,
                            foodName, foodDescription, foodExpiryTime, foodImage,
                            posterFirstName, posterSuiteNumber);

                          io.emit('delete return', (itemID));
                        }

                      });
                    }
                  } catch (error) {
                    console.log("Deleted too fast.", error);;
                  }
                }
              });
            }
          }
        });
      } else {
        // user is not currently in a session and therefore should'nt be able to delete a post
        slacklog.log('NICE TRY BUD!', '');
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

    //Declaring variables needed to generate automated claim email
    let sessionID = claim.sessionID;
    let itemID = claim.id;

    let role
    let posterUserID, posterEmail, posterFirstName;
    let foodName, foodDescription, foodExpiryTime, foodImage;
    let claimerUserID, claimerEmail, claimerFirstName, claimerSuiteNumber;

    var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
    mysqlconnection.pool.query(query, [sessionID], (error, rows, fields) => {
      if (error) {
        slacklog.log(`Event: Claim item. ${query}.`, error);
        console.log(new Date(Date.now()), "Error occured while inquiring for sessionID", error);

      } else if (rows.length) {

        claimerUserID = rows[0].Users_userID; // ID of the user in the session
        console.log("CLAIMERUSERID:", claimerUserID);

        var setClaimerID = `UPDATE FoodItem SET Users_claimerUserID = ? WHERE itemID = ?`;
        mysqlconnection.pool.query(setClaimerID, [claimerUserID, itemID], (error, rows, field) => {
          if (error) {
            //return error if update claimerID into failed
            slacklog.log(`Event: Claim item. ${setClaimerID}.`, error);
            console.log(new Date(Date.now()), "Error updating claimerID into FoodItem table: ", error);

          } else {
            // else return the updated table
            console.log("Successfully updated claimerID into FoodItem table.");
            console.log("PRINTING THE UPDATED FIELD OF FOODITEM TABLE WITH CLAIMER ID:", rows);

            var queryFoodItemTable = "SELECT * FROM FoodItem WHERE itemID = ?";
            mysqlconnection.pool.query(queryFoodItemTable, [itemID], (error, rows, field) => {
              if (error) {
                //error occured while attempting to query FoodItem Table
                slacklog.log(`Event: Claim item. ${queryFoodItemTable}.`, error);
                console.log(new Date(Date.now()), "Error querying from FoodItem Table", error);

              } else {
                console.log("Successfully obtained Poster's userID from FoodItem Table", rows);
                posterUserID = rows[0].Users_userID;
                foodName = rows[0].foodName;
                foodDescription = rows[0].foodDescription;
                foodExpiryTime = rows[0].foodExpiryTime;
                foodImage = rows[0].foodImage;
                console.log("THIS IS THE POSTER USER ID:", posterUserID);
                console.log("THIS IS THE CLAIMER USER ID:", claimerUserID);

                var claimerQuery = "SELECT * FROM users WHERE userID = ? LIMIT 1";
                mysqlconnection.pool.query(claimerQuery, [claimerUserID], (error, rows, field) => {
                  if (error) {
                    //return error if selection fail
                    slacklog.log(`Event: Claim item. ${claimerQuery}.`, error);
                    console.log(new Date(Date.now()), "Error grabbing user of claimed item: ", error);

                  } else {
                    //else return the users information
                    console.log("Successfully grabbed user of claimed item. ", rows);
                    claimerFirstName = rows[0].firstName;
                    claimerEmail = rows[0].email;
                    claimerSuiteNumber = rows[0].suiteNumber;

                    var posterQuery = "SELECT * FROM users WHERE userID = ? LIMIT 1";
                    mysqlconnection.pool.query(posterQuery, [posterUserID], (error, rows, field) => {
                      if (error) {
                        //return error if selection fail
                        slacklog.log(`Event: Claim item. ${posterQuery}.`, error);
                        console.log(new Date(Date.now()), "Error grabbing user of claimed item: ", error);

                      } else {
                        console.log("Successfully grabbed user of claimed item. ", rows);
                        posterFirstName = rows[0].firstName;
                        posterEmail = rows[0].email;

                        console.log("CLAIMERS FIRST NAME: ", claimerFirstName);
                        console.log("POSTERS FIRST NAME: ", posterFirstName);
                        console.log("CLAIMER SUITE NUMBER: ", claimerSuiteNumber);
                        console.log("CLAIMERUSERID:", claimerUserID);
                        console.log("POSTER EMAIL", posterEmail);
                        console.log("CLAIMER EMAIL", claimerEmail);

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
          }
        });
      } else {
        slacklog.log('NICE TRY BUD!', '');
        app.get('/nicetrybud');
      }
    });


  });

  socket.on("my claims", (claim) => {

    let sessionID = claim.sessionID;
    let claimerUserID;


    var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
    mysqlconnection.pool.query(query, [sessionID], (error, rows, fields) => {
      if (error) {
        slacklog.log(`Event: My claims. ${query}.`, error);
        console.log(new Date(Date.now()), "Error occurred while inquiring for sessionID", );

      } else {
        if (rows.length) {
          claimerUserID = rows[0].Users_userID;

          var userInfo = "SELECT * FROM FoodItem WHERE Users_claimerUserID = ?";
          mysqlconnection.pool.query(userInfo, [claimerUserID], (error, rows, fields) => {
            if (error) {
              slacklog.log(`Event: My claims. ${userInfo}.`, error);
              console.log(new Date(Date.now()), "Error selecting user's claims in my claims feature:", error);
            } else if (rows.length == 0) {
              console.log("There are no claimed posts");
            } else {
              socket.emit('my claims return', {
                rows: rows,
                claimerUserID: claimerUserID,
              });
            }

          });
        }
      }
    });
  });

  /************************************************************************
   * 
   *          MY CLAIMS - UNCLAIM FEATURE - SERVER SIDE
   * 
   * 
   ***********************************************************************/


  socket.on('unclaim item', (cardID) => {
    console.log("Entered Unclaim Item Event");
    let postID = cardID.cardID;
    let sessionID = cardID.sessionID;
    let posterUserID, posterEmail, posterFirstName;
    let foodName, foodDescription, foodExpiryTime, foodImage;
    let claimerUserID, claimerFirstName, claimerSuiteNumber;

    var query = `SELECT * FROM Sessions WHERE sessionID = ? LIMIT 1`;
    mysqlconnection.pool.query(query, [sessionID], (error, rows, fields) => {
      if (error) {
        console.log(new Date(Date.now()), "Error occurred while inquiring for sessionID", error);

      } else {
        console.log("User is logged in and can unclaim the fooditem.");
        if (rows.length) {

          claimerUserID = rows[0].Users_userID;

          var queryForInformation = "SELECT * FROM FoodItem WHERE itemID = ?";
          mysqlconnection.pool.query(queryForInformation, [postID], (error, rows, field) => {
            if (error) {
              slacklog.log(`Event: Unclaim item. ${queryForInformation}.`, error);
              console.log(new Date(Date.now()), "Error querying for food item information in unclaim event", error);

            } else {
              console.log("Successfully obtained food item information in unclaim event.");
              foodName = rows[0].foodName;
              foodDescription = rows[0].foodDescription;
              foodExpiryTime = rows[0].foodExpiryTime;
              foodImage = rows[0].foodImage;
              posterUserID = rows[0].Users_userID;

              var queryUpdateUnclaim = `UPDATE FoodItem SET Users_claimerUserID = ? WHERE itemID = ${postID}`;
              mysqlconnection.pool.query(queryUpdateUnclaim, [null], (error, rows, field) => {
                if (error) {
                  slacklog.log(`Event: Unclaim item. ${queryUpdateUnclaim}.`, error);
                  console.log(new Date(Date.now()), "Error changing claim status of food item", error);

                } else {
                  console.log("Successfully unclaimed food item.");

                  var claimerQuery = "SELECT * FROM users WHERE userID = ? LIMIT 1";
                  mysqlconnection.pool.query(claimerQuery, [claimerUserID], (error, rows, field) => {
                    if (error) {
                      //return error if selection fail
                      slacklog.log(`Event: Claim item. ${claimerQuery}.`, error);
                      console.log(new Date(Date.now()), "Error grabbing user of claimed item: ", error);

                    } else {
                      //else return the users information
                      console.log("Successfully grabbed user of claimed item. ", rows);
                      claimerFirstName = rows[0].firstName;
                      claimerEmail = rows[0].email;
                      claimerSuiteNumber = rows[0].suiteNumber;

                      var posterQuery = "SELECT * FROM users WHERE userID = ? LIMIT 1";
                      mysqlconnection.pool.query(posterQuery, [posterUserID], (error, rows, field) => {
                        if (error) {
                          //return error if selection fail
                          slacklog.log(`Event: Claim item. ${posterQuery}.`, error);
                          console.log(new Date(Date.now()), "Error grabbing user of claimed item: ", error);

                        } else {
                          console.log("Successfully grabbed user of claimed item. ", rows);
                          posterFirstName = rows[0].firstName;
                          posterEmail = rows[0].email;

                          console.log("CLAIMERS FIRST NAME: ", claimerFirstName);
                          console.log("POSTERS FIRST NAME: ", posterFirstName);
                          console.log("CLAIMER SUITE NUMBER: ", claimerSuiteNumber);
                          console.log("CLAIMERUSERID:", claimerUserID);
                          console.log("POSTER EMAIL", posterEmail);
                          console.log("CLAIMER EMAIL", claimerEmail);

                          // Send email to poster that their food item has been unclaimed.
                          sendUnclaimEmailToPoster(posterEmail, posterFirstName, foodName, foodDescription, foodExpiryTime, foodImage, claimerFirstName, claimerSuiteNumber);
                          socket.emit('unclaim item return', {
                            cardID: postID,
                          });
                        }

                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  });
});


/*************************************************************************
 * 
 *     MISCELLANEOUS FUNCTIONS USED IN FEATURES: DELETE, CLAIM, UNCLAIM
 * 
 *************************************************************************/
function sendDeleteEmailToClaimer(claimerEmail, claimerFirstName, foodName, foodDescription, foodExpiryTime, foodImage, posterFirstName, posterSuiteNumber) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // service: 'smtp.ethereal.email',
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: 'foodboardcanada@gmail.com',
      // user: 'de5kzppbkaumnfhu@ethereal.email',
      pass: 'darkthemesonly'
      // pass: 'wNmg25t9fqKXZ8wVUF'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.use('compile', inlineCss()); // allows for inline styling within emails

  let mailOptions = {
    from: `foodboardcanada@gmail.com`, // sender address
    to: claimerEmail, // list of receivers
    subject: 'FoodBoard: The food item you claimed is no longer available', // Subject line
    text: `Hello ${claimerFirstName},

  Unfortunately, your neighbor ${ posterFirstName} from Apartment Suite ${posterSuiteNumber} has deleted their posted food item.
    Here's a reminder of what their post looked like.

  Food Name: ${ foodName}
  Food Description: ${ foodDescription}
  Food Expiry: ${ foodExpiryTime}

  Thanks for using FoodBoard.We love that you're just as committed to reducing food-waste as we are!`, // plain text body
    html: `<div style="background: #DDE5E5" id="email-container">
          <div style="text-align: center;" id="homepage-body">
            <img style="width: 60%" src="cid:foodboardlogo" alt="FoodBoard logo"/>
            <p style="font-size: 12pt; margin-top: 10px"><i>Share More, Waste Less</i></p>
          </div>
          <div style="font-size: 10pt" id="email-body">
            <p style="text-align: left;">Hello ${claimerFirstName},</p>
            <p style="text-align: left;">Unfortunately, your neighbor ${posterFirstName} from Apartment Suite ${posterSuiteNumber} has deleted their posted food item.
            Here's a reminder of what their post looked like.</p>
          </div>
          <div style="width: 100%;" id="email-food-table">
            <table style="margin: 0 auto; font-size: 10pt"><br/>
              <tr>
                <td style="width: 30%">Food Name:</td>
                <td style="width: 70%">${foodName}</td>
              </tr>
              <tr>
                <td style="width: 30%">Food Description:</td>
                <td style="width: 70%">${foodDescription}</td>
              </tr>
              <tr>
                <td style="width: 30%">Food Expiry:</td>
                <td style="width: 70%">${foodExpiryTime}</td>
              </tr>
            </table><br/>
          </div>
          <div>
            <p style="text-align: center; font-size: 10pt">Food Image:</p>
          </div>
          <div style="width: 100%; text-align: center;" id="email-image">
            <img style="display: margin-right: auto; display: margin-left: auto" src="cid:donotreply@foodboard.ca"/><br/>
          </div>
          <div>
            <p style="text-align: center; font-size: 10pt">Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!<p>
          </div>
        </div>`, // html body
    attachments: [{
      filename: `foodboard_${foodImage}`,
      path: `./app/images/${foodImage}`,
      cid: 'donotreply@foodboard.ca'
    },
    {
      filename: 'foodboard_logo',
      path: './app/Pictures/largelogo-text-transparent.png',
      cid: 'foodboardlogo'
    }
    ]
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      slacklog.log(`Event: Send Delete Mail ${info}`, error);
      console.log("Error occured sending claim email", error);
    } else {
      // Preview only available when sending through an Ethereal account

      // If successful, should print the following to the console:
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

      slacklog.log(`Event: Send Delete Mail ${info}`, '');
      console.log('Claim message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });
};

function sendClaimEmailToPoster(posterEmail, posterFirstName, foodName, foodDescription, foodExpiryTime, foodImage, claimerEmail, claimerFirstName, claimerSuiteNumber) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // service: 'smtp.ethereal.email',
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: 'foodboardcanada@gmail.com',
      // user: 'de5kzppbkaumnfhu@ethereal.email',
      pass: 'darkthemesonly'
      // pass: 'wNmg25t9fqKXZ8wVUF'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.use('compile', inlineCss()); // allows for inline styling within emails

  // setup email data with unicode symbols
  let mailOptions = {
    from: `foodboardcanada@gmail.com`, // sender address
    to: posterEmail, // list of receivers
    subject: 'FoodBoard: Your food item has been claimed', // Subject line
    text: `Hello ${posterFirstName},

  Your neighbor ${ claimerFirstName} from Apartment Suite ${claimerSuiteNumber} has claimed your food item! You can
  let ${ claimerFirstName} know what time is best to pick up your food item by contacting him or her at ${claimerEmail}.

    Here's a reminder of what you posted on foodboard.ca.

  Food Name: ${ foodName}
  Food Description: ${ foodDescription}
  Food Expiry: ${ foodExpiryTime}

  Thanks for using FoodBoard.We love that you're just as committed to reducing food-waste as we are!`, // plain text body
    html: `<div style="background: #DDE5E5" id="email-container">
          <div style="text-align: center;" id="homepage-body">
            <img style="width: 60%" src="cid:foodboardlogo" alt="FoodBoard logo"/>
            <p style="font-size: 12pt; margin-top: 10px"><i>Share More, Waste Less</i></p>
          </div>
          <div style="font-size: 10pt" id="email-body">
            <p style="text-align: left;">Hello ${posterFirstName},</p>
            <p style="text-align: left;">Your neighbor ${claimerFirstName} from Apartment Suite ${claimerSuiteNumber} has claimed your food item! You can 
              let ${claimerFirstName} know what time is best to pick up your food item by contacting him or her at ${claimerEmail}.</p>
          </div>
          <div style="width: 100%;" id="email-food-table">
            <table style="margin: 0 auto; font-size: 10pt"><br/>
              <tr>
                <td style="width: 30%">Food Name:</td>
                <td style="width: 70%">${foodName}</td>
              </tr>
              <tr>
                <td style="width: 30%">Food Description:</td>
                <td style="width: 70%">${foodDescription}</td>
              </tr>
              <tr>
                <td style="width: 30%">Food Expiry:</td>
                <td style="width: 70%">${foodExpiryTime}</td>
              </tr>
            </table><br/>
          </div>
          <div>
            <p style="text-align: center; font-size: 10pt">Food Image:</p>
          </div>
          <div style="width: 100%; text-align: center;" id="email-image">
            <img style="display: margin-right: auto; display: margin-left: auto" src="cid:donotreply@foodboard.ca"/><br/>
          </div>
          <div>
            <p style="text-align: center; font-size: 10pt">Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!<p>
          </div>
        </div>`, // html body
    attachments: [{
      filename: `foodboard_${foodImage}`,
      path: `./app/images/${foodImage}`,
      cid: 'donotreply@foodboard.ca'
    },
    {
      filename: 'foodboard_logo',
      path: './app/Pictures/largelogo-text-transparent.png',
      cid: 'foodboardlogo'
    }
    ]
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      slacklog.log(`Event: Send Claim Mail ${info}`, error);
      console.log("Error occured sending claim email", error);
    } else {
      // Preview only available when sending through an Ethereal account

      // If successful, should print the following to the console:
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      slacklog.log(`Event: Send Claim Mail ${JSON.stringify(info, undefined, 3)}`, '');
      console.log('Claim message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });

};

function sendUnclaimEmailToPoster(posterEmail, posterFirstName, foodName, foodDescription, foodExpiryTime, foodImage, claimerFirstName, claimerSuiteNumber) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    //  service: 'smtp.ethereal.email',
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: 'foodboardcanada@gmail.com',
      //  user: 'de5kzppbkaumnfhu@ethereal.email',
      pass: 'darkthemesonly'
      //  pass: 'wNmg25t9fqKXZ8wVUF'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.use('compile', inlineCss()); // allows for inline styling within emails

  // setup email data with unicode symbols
  let mailOptions = {
    from: `foodboardcanada@gmail.com`, // sender address
    to: posterEmail, // list of receivers
    subject: 'FoodBoard: Your food item has been unclaimed', // Subject line
    text: `Hello ${posterFirstName},

    Unfortunately, your neighbor ${claimerFirstName} from Apartment Suite ${claimerSuiteNumber} has unclaimed your food item. 
    Here's a reminder of what your post looks like.

    Here's a reminder of what you posted on foodboard.ca.
           
    Food Name: ${foodName}
    Food Description: ${foodDescription}
    Food Expiry: ${foodExpiryTime}
    
    Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!`, // plain text body
    html: `<div style="background: #DDE5E5" id="email-container">
          <div style="text-align: center;" id="homepage-body">
            <img style="width: 60%" src="cid:foodboardlogo" alt="FoodBoard logo"/>
            <p style="font-size: 12pt; margin-top: 10px"><i>Share More, Waste Less</i></p>
          </div>
          <div style="font-size: 10pt" id="email-body">
            <p style="text-align: left;">Hello ${posterFirstName},</p>
            <p style="text-align: left;">Unfortunately, your neighbor ${claimerFirstName} from Apartment Suite ${claimerSuiteNumber} has unclaimed your food item. 
            Here's a reminder of what your post looks like.</p>
          </div>
          <div style="width: 100%;" id="email-food-table">
            <table style="margin: 0 auto; font-size: 10pt"><br/>
              <tr>
                <td style="width: 30%">Food Name:</td>
                <td style="width: 70%">${foodName}</td>
              </tr>
              <tr>
                <td style="width: 30%">Food Description:</td>
                <td style="width: 70%">${foodDescription}</td>
              </tr>
              <tr>
                <td style="width: 30%">Food Expiry:</td>
                <td style="width: 70%">${foodExpiryTime}</td>
              </tr>
            </table><br/>
          </div>
          <div>
            <p style="text-align: center; font-size: 10pt">Food Image:</p>
          </div>
          <div style="width: 100%; text-align: center;" id="email-image">
            <img style="display: margin-right: auto; display: margin-left: auto" src="cid:donotreply@foodboard.ca"/><br/>
          </div>
          <div>
            <p style="text-align: center; font-size: 10pt">Thanks for using FoodBoard. We love that you're just as committed to reducing food-waste as we are!<p>
          </div>
        </div>`, // html body
    attachments: [{
      filename: `foodboard_${foodImage}`,
      path: `./app/images/${foodImage}`,
      cid: 'donotreply@foodboard.ca'
    },
    {
      filename: 'foodboard_logo',
      path: './app/Pictures/largelogo-text-transparent.png',
      cid: 'foodboardlogo'
    }
    ]
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      slacklog.log(`Event: Send Unclaim Mail ${JSON.stringify(info, undefined, 3)}`, error);
      console.log("Error occured sending unclaim email", error);
    } else {
      // Preview only available when sending through an Ethereal account

      // If successful, should print the following to the console:
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      slacklog.log(`Event: Send Unclaim Mail ${JSON.stringify(info, undefined, 3)}`, '');
      console.log('Unclaim message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });
};

function deleteFoodItem(itemID) {
  var deletePost = `DELETE FROM FoodItem WHERE itemID = ? LIMIT 1`;
  mysqlconnection.pool.query(deletePost, [itemID], (error, rows, field) => {
    if (error) {

      // return error if insertion fail
      slacklog.log(`Event: Delete food item. ${deletePost}.`, error);
      console.log("Error occured when attempting to delete post: ", error);
    } else {
      // else return the updated table
      console.log("Successful deletion of claimed food item.");
    }

  });;

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
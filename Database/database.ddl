-- Create table for User Accounts.
CREATE TABLE user (
  UserID int NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(30) NOT NULL,
  LastName VARCHAR(30) NOT NULL, 
  Email VARCHAR(30) NOT NULL,
  SuiteNumber int(10) NOT NULL,
  PRIMARY KEY (ID),
);

-- Create table for User Postings.  'Junction Table'
CREATE TABLE userPost (
  UserID int NOT NULL,
  ItemID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (UserID),
  FOREIGN KEY (ItemID),
);

-- Create table for Food Items.
CREATE TABLE foodItem (
  ItemID int NOT NULL AUTO_INCREMENT,
  FoodName VARCHAR(30) NOT NULL,
  FoodGroup VARCHAR (20),
  FoodDescription VARCHAR(50),
  FoodImage BLOB NOT NULL,
  FoodExpiryTime DATETIME NOT NULL,
  PRIMARY KEY (ItemID),
);
-- Order items in descending order by the Posting Time.
SELECT * from foodItem;
ORDER BY FoodExpiryTime DESC;


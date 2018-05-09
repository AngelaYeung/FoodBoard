-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2018 at 09:10 PM
-- Server version: 10.1.31-MariaDB
-- PHP Version: 7.2.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foodboard`
--

-- --------------------------------------------------------

--
-- Table structure for table `foodboardboard`
--

CREATE TABLE `foodboardboard` (
  `BoardPostID` int(11) NOT NULL,
  `UserPostClaimed` tinyint(4) DEFAULT '0',
  `Posting_PostID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `fooditem`
--

CREATE TABLE `fooditem` (
  `itemID` int(11) NOT NULL,
  `foodName` varchar(45) NOT NULL COMMENT 'Holds the name of the food item',
  `foodDescription` varchar(255) NOT NULL,
  `foodGroup` varchar(45) NOT NULL COMMENT 'Holds the food group of the item',
  `foodExpiryTime` varchar(255) NOT NULL COMMENT 'Holds the expiry date of the food item',
  `foodImage` varchar(255) NOT NULL COMMENT 'Holds the image of the food item'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `fooditem`
--

INSERT INTO `fooditem` (`itemID`, `foodName`, `foodDescription`, `foodGroup`, `foodExpiryTime`, `foodImage`) VALUES
(41, 'Apples', 'Apples', 'Produce', '', 'apple.jpg'),
(42, 'apple', 'apple', 'Produce', '111111-11-11T11:11', 'apple.jpg'),
(43, 'oranges', 'oranges', 'Produce', '2018-12-30T00:59', 'apple.jpg'),
(44, 'uihf', 'udsiahf', 'Produce', '2019-01-01T02:00', 'groceries.png'),
(45, 'Oranges', 'Oranges', 'Meat', '2018-12-31T12:59', 'hero-image-flat.jpg'),
(46, 'TestItem', 'Test', 'Produce', '111111-11-11T11:11', 'grow.png');

-- --------------------------------------------------------

--
-- Table structure for table `posting`
--

CREATE TABLE `posting` (
  `PostID` int(11) NOT NULL,
  `FoodItem_ItemID` int(11) NOT NULL,
  `User_UserID` int(11) NOT NULL,
  `ClaimedStatus` varchar(10) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `userlist`
--

CREATE TABLE `userlist` (
  `ListingID` int(11) NOT NULL,
  `User_UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `suiteNumber` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Indexes for table `foodboardboard`
--
ALTER TABLE `foodboardboard`
  ADD PRIMARY KEY (`BoardPostID`,`Posting_PostID`),
  ADD KEY `fk_FoodboardBoard_Posting1_idx` (`Posting_PostID`);

--
-- Indexes for table `fooditem`
--
ALTER TABLE `fooditem`
  ADD PRIMARY KEY (`itemID`);

--
-- Indexes for table `posting`
--
ALTER TABLE `posting`
  ADD PRIMARY KEY (`PostID`,`FoodItem_ItemID`,`User_UserID`),
  ADD KEY `fk_Posting_FoodItem1_idx` (`FoodItem_ItemID`),
  ADD KEY `fk_Posting_User1_idx` (`User_UserID`);

--
-- Indexes for table `userlist`
--
ALTER TABLE `userlist`
  ADD PRIMARY KEY (`ListingID`,`User_UserID`),
  ADD KEY `fk_UserList_User1_idx` (`User_UserID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `fooditem`
--
ALTER TABLE `fooditem`
  MODIFY `itemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `posting`
--
ALTER TABLE `posting`
  MODIFY `PostID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `userlist`
--
ALTER TABLE `userlist`
  MODIFY `ListingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

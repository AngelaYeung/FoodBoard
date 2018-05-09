-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2018 at 07:12 PM
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

--
-- Dumping data for table `foodboardboard`
--

INSERT INTO `foodboardboard` (`BoardPostID`, `UserPostClaimed`, `Posting_PostID`) VALUES
(1, 0, 0);

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
(45, 'Oranges', 'Oranges', 'Meat', '2018-12-31T12:59', 'hero-image-flat.jpg');

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

--
-- Dumping data for table `posting`
--

INSERT INTO `posting` (`PostID`, `FoodItem_ItemID`, `User_UserID`, `ClaimedStatus`) VALUES
(3, 8, 22, '0');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `UserID` int(11) NOT NULL,
  `FirstName` varchar(45) NOT NULL COMMENT 'Holds contact first name',
  `LastName` varchar(45) NOT NULL COMMENT 'Holds user last name',
  `Email` varchar(45) NOT NULL COMMENT 'Holds user email\n',
  `SuiteNumber` int(10) NOT NULL COMMENT 'Holds user''s apartment suite number\n',
  `Password` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `FirstName`, `LastName`, `Email`, `SuiteNumber`, `Password`) VALUES
(22, 'Michael', 'Yu', 'michaelmhyu@hotmail.com', 222, 'testpassword');

-- --------------------------------------------------------

--
-- Table structure for table `userlist`
--

CREATE TABLE `userlist` (
  `ListingID` int(11) NOT NULL,
  `User_UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `userlist`
--

INSERT INTO `userlist` (`ListingID`, `User_UserID`) VALUES
(1, 22);

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
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `firstName`, `lastName`, `email`, `password`, `suiteNumber`, `createdAt`, `updatedAt`) VALUES
(2, NULL, NULL, 'test@gmail.com', '$2a$08$pPYFr.2z6R1eb4TYJNobEug3oeQastqqItg3G0nEat1q78ypZcidW', '3242', '2018-05-07 06:12:52', '2018-05-07 06:12:52'),
(3, NULL, NULL, 'test@gmail.com', '$2a$08$v7U2iK/ZHMJvkQUanCqwPOnrxFkPnMywPsxbiysmwBSi/UFcW6jHS', '3242', '2018-05-07 06:14:36', '2018-05-07 06:14:36'),
(4, NULL, NULL, 'michaelmhyu@hotmail.com', '$2a$10$sXhaP1MW.jVYn4Nh98CIZekyFJLRCkB4IYeuK96W24q5R772XdB/O', '3333', '2018-05-07 06:59:13', '2018-05-07 06:59:13'),
(5, NULL, NULL, 'robertozdoba@gmail.com', '$2a$10$CTsLJzXfjX5v3Wd8QiL6P.39It9R22Y81EbjpAd00Tif8V/KsQ/BC', '3333', '2018-05-07 15:49:22', '2018-05-07 15:49:22'),
(6, NULL, NULL, 'robertozdoba@gmail.com', '$2a$10$PEKBoiYSpV2ci0Y1cjgePemRoxCkoA6yIQJiddrzP/4aDIJdikFsa', '3243423', '2018-05-07 16:13:52', '2018-05-07 16:13:52'),
(7, NULL, NULL, 'robertozdoba@gmail.com', '$2a$10$y.b5t8tAO7a8l0i52boWUuo.FN7COJZ0N01Sv86fPUPtJ5ZJnEfQ.', '1324', '2018-05-07 16:16:17', '2018-05-07 16:16:17'),
(8, NULL, NULL, 'robertozdoba@gmail.com', '$2a$10$WcgZGnkMVwNzBUA1PRIS4eslZFN9WjYvxVLI89dty.49gl4gtsmVq', '333', '2018-05-07 16:22:21', '2018-05-07 16:22:21'),
(9, NULL, NULL, 'robertozdoba@gmail.com', '$2a$10$.l7cmEiLaMKPa3hsuBFYU.Fzlp0LObR0CMrnGwurR0NQ/kZIvyDoG', '333', '2018-05-07 16:25:35', '2018-05-07 16:25:35'),
(10, NULL, NULL, 'jamesse@gmail.com', '$2a$10$9ZRPlA/8sfC47dnlBy1T/OkQ8oY.ZNDykeaLJhQrrbTru55lgXEF2', '999', '2018-05-07 23:03:28', '2018-05-07 23:03:28'),
(11, NULL, NULL, 'jeams@gmail.com', '$2a$10$RhazFVoEuoj/d9LONnjGWOSlWEpxvtRg8glhwpackPhHgSEJEWwYu', '311', '2018-05-08 17:12:22', '2018-05-08 17:12:22'),
(12, NULL, NULL, 'test123@gmail.com', '$2a$10$fAI3LXKumKg3Jtm/ehQQY.8LTPgU49gL8/1VXPN7wCJalDAzyfugm', '32423', '2018-05-09 17:11:16', '2018-05-09 17:11:16');

--
-- Indexes for dumped tables
--

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
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`);

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
  MODIFY `itemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `posting`
--
ALTER TABLE `posting`
  MODIFY `PostID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `userlist`
--
ALTER TABLE `userlist`
  MODIFY `ListingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

GRANT USAGE ON *.* TO 'gnovi'@'localhost' IDENTIFIED BY PASSWORD '*F3D2951C35D45EC6069AA36B464AB698354F999A'
GRANT SELECT ON `gnovi`.`Users` TO 'gnovi'@'localhost'
GRANT SELECT ON `gnovi`.`Wordcheck` TO 'gnovi'@'localhost'
GRANT SELECT ON `gnovi`.`InitialWords` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT ON `gnovi`.`Runs` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT ON `gnovi`.`RunWords` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT, UPDATE (Word) ON `gnovi`.`Words` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT, UPDATE ON `gnovi`.`Relations` TO 'gnovi'@'localhost'

--
-- Database: `gnovi`
--

-- --------------------------------------------------------

--
-- Table structure for table `InitialWords`
--

CREATE TABLE `InitialWords` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Word` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `Frequency` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `Relations`
--

CREATE TABLE `Relations` (
  `FromWordID` int(11) NOT NULL,
  `ToWordID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Time` int(10) unsigned NOT NULL,
  `Strength` float NOT NULL,
  UNIQUE KEY `FromWordID_2` (`FromWordID`,`ToWordID`,`UserID`,`Time`),
  KEY `UserID` (`UserID`),
  KEY `Time` (`Time`),
  KEY `FromWordID` (`FromWordID`),
  KEY `ToWordID` (`ToWordID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `Runs`
--

CREATE TABLE `Runs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Time` int(11) unsigned NOT NULL,
  `InitialWordID` int(11) NOT NULL,
  `LocationTMP` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `RunWords`
--

CREATE TABLE `RunWords` (
  `RunID` int(11) NOT NULL,
  `WordID` int(11) NOT NULL,
  `DistanceFromInitialWord` int(11) NOT NULL,
  `DistanceFromLocation` int(11) NOT NULL,
  `Connotation` int(11) NOT NULL,
  UNIQUE KEY `RunID` (`RunID`,`WordID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) COLLATE utf8_bin NOT NULL,
  `Email` varchar(255) COLLATE utf8_bin NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8_bin NOT NULL,
  `Salt` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `Wordcheck`
--

CREATE TABLE `Wordcheck` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Word` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `Frequency` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `word` (`Word`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `Words`
--

CREATE TABLE `Words` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Word` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Word` (`Word`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

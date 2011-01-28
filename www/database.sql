GRANT USAGE ON *.* TO 'gnovi'@'localhost' IDENTIFIED BY PASSWORD '*F3D2951C35D45EC6069AA36B464AB698354F999A'
GRANT SELECT ON `gnovi`.`Users` TO 'gnovi'@'localhost'
GRANT SELECT ON `gnovi`.`Wordcheck` TO 'gnovi'@'localhost'
GRANT SELECT ON `gnovi`.`InitialWords` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT ON `gnovi`.`Runs` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT ON `gnovi`.`RunWords` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT, UPDATE (Word) ON `gnovi`.`Words` TO 'gnovi'@'localhost'
GRANT SELECT, INSERT, UPDATE ON `gnovi`.`Relations` TO 'gnovi'@'localhost'

--
-- Table structure for table `Runs`
--

CREATE TABLE IF NOT EXISTS `Runs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `InitialWordID` int(11) NOT NULL,
  `LocationTMP` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `RunWords`
--

CREATE TABLE IF NOT EXISTS `RunWords` (
  `RunID` int(11) NOT NULL,
  `WordID` int(11) NOT NULL,
  `ExactTyping` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `Occurrence` set('RANDOMWORD','LOCATION') COLLATE utf8_unicode_ci NOT NULL,
  `Connotation` enum('+','-') COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `RunID` (`RunID`,`WordID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE IF NOT EXISTS `Users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `Email` varbinary(255) NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `Salt` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Words`
--

CREATE TABLE IF NOT EXISTS `Words` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Word` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Word` (`Word`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

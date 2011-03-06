function piwikTrackPage()
{
    var piwikBaseURL = document.location.protocol == "https:" ? "https://piwik.gerade.org/" : "http://piwik.gerade.org/";
    var piwikTracker = Piwik.getTracker(piwikBaseURL + "piwik.php", 10);
    piwikTracker.trackPageView();
    piwikTracker.enableLinkTracking();
}

piwikTrackPage();

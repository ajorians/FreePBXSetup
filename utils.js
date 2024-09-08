function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   });
}

async function takeScreenshot(page, filename) {
   if( !page ) {
      console.log("Page is NULL.  Cannot continue");
      return;
   }

   const path = "/srv/www/htdocs/allwrite/";
   const screenshotPath = path + filename;

   console.log("Taking screenshot: " + screenshotPath);

   await page.screenshot({
     path: screenshotPath
   });
}

module.exports = {
   delay,
   takeScreenshot
};

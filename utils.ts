import * as fs from 'fs';

export function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   });
}

export async function takeScreenshot(page, filename) {
   if( !page ) {
      console.log("Page is NULL.  Cannot continue");
      return;
   }

   const dirpath = "/tmp/";
   if( fs.existsSync( dirpath ) ){
      const screenshotPath = dirpath + filename;

      console.log("Taking screenshot: " + screenshotPath);

      await page.screenshot({
        path: screenshotPath
      });
   }
}


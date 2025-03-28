import * as utils from './utils.ts';
import * as buttons from './buttons.ts';
import * as login from './login.ts';
import * as reload from './reload.ts';

async function getLinkWithText(page, text) {
   const links = await page.$$('a'); // Find all links on the page

   for(const link of links) {
      const textContent = await link.evaluate(el => el.textContent.trim());
      //console.log("Link text: " + textContent);
      if( textContent === text ) {
         return link;
      }
   }

   return null;
}

async function enableVideoSupport(page)
{
   // Click Settings > Asterisk IAX Settings
   const settingsLink = await getLinkWithText(page, 'Settings');
   settingsLink.hover();

   await utils.takeScreenshot(page, "hoveredSettings.png");

   const iaxSettingsLink = await getLinkWithText(page, 'Asterisk IAX Settings');
   iaxSettingsLink.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "iaxSettings.png");

   const codecSettingsButton = await getLinkWithText(page, "Codec Settings");
   await codecSettingsButton.click();

   await utils.delay(3000);

   await utils.takeScreenshot(page, "codecSettings.png");

   const videoSupportYesButton = await page.$('#videosupport-yes');

   if( videoSupportYesButton ) {
      console.log("Found yes button");

      if( videoSupportYesButton.checked ) {
         console.log("Yes is checked");
	 return true;
      }
      else {
         console.log("Yes is not checked");
      }

      await page.click('label[for="videosupport-yes"]');
   }
   else{
	   console.log("Could not find yes button");
	   return false;
   }

   await utils.takeScreenshot(page, "videoSupportYes.png");
 //  await videoSupportYesButton.click();
   await utils.delay(4000);

   await page.click('#ajaxsubmit');

   await utils.delay(4000);

   await reload.reloadConfig( page );

   return true;
}

export async function configureIAXSettings(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   await enableVideoSupport(page);

   return true;
}


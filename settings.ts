import * as utils from './utils.ts';
import * as login from './login.ts';

export async function configureSettings(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   const settingsSelector = '#fpbx-menu-collapse > ul > li:nth-child(6)'
   await page.waitForSelector(settingsSelector);
   await page.hover(settingsSelector)

   const advancedSettingsSelector = '#fpbx-menu-collapse > ul > li:nth-child(6) > ul > li:nth-child(1) > a';
   await page.waitForSelector(advancedSettingsSelector);
   await page.hover(advancedSettingsSelector);
   await page.click(advancedSettingsSelector);

   await utils.delay(10000); //10 seconds

   await utils.takeScreenshot(page, "advancedSettings.png");

   const launchAGIValueSelector = '#LAUNCH_AGI_AS_FASTAGIfalse';
   await page.waitForSelector(launchAGIValueSelector);
   const localAGIRadioElement = await page.$(launchAGIValueSelector);
   const localAGIValue = await page.evaluate(el => el.value, localAGIRadioElement);

   console.log("Launch Local AGI Value is: " + localAGIValue);
   if( localAGIValue === "true" ) {
      console.log("Launch Local AGI Value is true; we need to set it to false");
      //TODO: Set setting to false
      return false;
   }

   return true;
}

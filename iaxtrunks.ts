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

async function getTabWithText(page, text) {
   const tabs = await page.$$('.tab-selector');

   for(const tab of tabs) {
      const textContent = await page.evaluate(el => el.textContent.trim());
      console.log( "Tab text: " + textContent );
      if( textContent === text ) {
         return tab;
      }
   }

   return null;
}

async function hasIAXTrunk(page, trunkName) {
   await page.waitForSelector('#table-all > tbody');

   const trunkRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#table-all tbody tr'));

      return rows.map(row => {
         const column = row.querySelectorAll('td')[1]; // Second column (0-based index)
         return column ? column.innerText.trim() : null;
      }).filter(text => text !== null);
   });

   for( const row of trunkRows ){
      if( row == trunkName ) {
         return true;
      }
   }

   return false;
}

async function addIAXTrunk(page, trunkName, phoneNumber, password)
{
   if( await hasIAXTrunk(page, trunkName) ){
      console.log("Has trunk: " + trunkName);
      return true;
   }

   const addTrunkButton = await buttons.getButtonsWithText(page, "Add Trunk");
   await addTrunkButton.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addtrunks.png");

   //const links = await describeElementsByType(page, 'a');
   //console.log(links);

   const addIAXTrunkLink = await getLinkWithText(page, 'Add IAX2 Trunk');
   addIAXTrunkLink.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addiaxtrunk.png");

   const trunkNameElement = await page.$('#trunk_name');

   if( !trunkNameElement )
   {
      console.log("No trunk name element");
      return false;
   }

   await trunkNameElement.focus();
   await trunkNameElement.type(trunkName);

   const iax2SettingsTab = await page.$('.change-tab:nth-child(3)');

   if( !iax2SettingsTab )
   {
      console.log("No IAX2 Settings Tab element");
      return false;
   }

   iax2SettingsTab.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "iax2settings.png");

   const trunkNameIAXSettingsElement = await page.$('#channelid');

   if( !trunkNameIAXSettingsElement )
   {
      console.log("No trunk name IAX Settings element");
      return false;
   }

   await trunkNameIAXSettingsElement.focus();
   await trunkNameIAXSettingsElement.type(trunkName);

   await utils.takeScreenshot(page, "addedTrunkName.png");

   const peerDetailsElement = await page.$('#peerdetails');

   if( !peerDetailsElement )
   {
      console.log("No peer details element");
      return false;
   }

   await peerDetailsElement.focus();
   await page.keyboard.down('ControlLeft')
   await page.keyboard.press('KeyA')
   await page.keyboard.up('ControlLeft')
   await peerDetailsElement.type(trunkName);

   await utils.takeScreenshot(page, "inputtedIAX2Settings.png");

   await page.click('#submit');

   await reload.reloadConfig( page );

   return true;
}

export async function addTrunks(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   // Click Connectivity > Trunks
   const connectivityLink = await getLinkWithText(page, 'Connectivity');
   connectivityLink.hover();

   await utils.takeScreenshot(page, "hoveredConnectivity.png");

   const trunksLink = await getLinkWithText(page, 'Trunks');
   trunksLink.click();

   await utils.delay(4000);
 
   await utils.takeScreenshot(page, "trunks.png");

   if( !(await addIAXTrunk(page, "voip", "5173480350", "0G&)ynqfMnqA") ) ) {
      return false;
   }

   return true;
}


import * as utils from './utils.ts';
import * as buttons from './buttons.ts';
import * as login from './login.ts';
import * as reload from './reload.ts';
import * as variables from './variables.ts';

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

async function hasSIPTrunk(page, trunkName) {
   await page.waitForSelector('#table-all > tbody');

   const trunkRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#table-all tbody tr'));

      return rows.map(row => {
         const column = row.querySelectorAll('td')[0]; // First column (0-based index)
         return column ? column.innerText.trim() : null;
      }).filter(text => text !== null);
   });

   for( const row of trunkRows ){
      //console.log("row: " + row);
      if( row == trunkName ) {
         return true;
      }
   }

   return false;
}

async function addSIPTrunk(page, trunkName, sipServer, phoneNumber, username, password)
{
   if( await hasSIPTrunk(page, trunkName) ){
      console.log("Has SIP trunk: " + trunkName);
      return true;
   }

   const addTrunkButton = await buttons.getButtonsWithText(page, "Add Trunk");
   await addTrunkButton.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addtrunks.png");

   const addSIPTrunkLink = await getLinkWithText(page, 'Add SIP (chan_pjsip) Trunk');
   addSIPTrunkLink.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addsiptrunk.png");

   const trunkNameElement = await page.$('#trunk_name');

   if( !trunkNameElement )
   {
      console.log("No trunk name element");
      return false;
   }

   await trunkNameElement.focus();
   await trunkNameElement.type(trunkName);

   await utils.delay(1000);

   const outboundCallerIDElement = await page.$('#outcid');

   if( !outboundCallerIDElement )
   {
      console.log("No outbound Caller ID element");
      return false;
   }

   await outboundCallerIDElement.focus();
   await outboundCallerIDElement.type(phoneNumber);

   await utils.delay(1000);

   await utils.takeScreenshot(page, "pjsipoutboundcallerid.png");

   const pjsipSettingsTab = await page.$('.change-tab:nth-child(3)');

   if( !pjsipSettingsTab )
   {
      console.log("No PJSIP Settings Tab element");
      return false;
   }

   pjsipSettingsTab.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "pjsipsettings.png");

   const usernameElement = await page.$('#username');

   if( !usernameElement )
   {
      console.log("No username PJSIP Settings element");
      return false;
   }

   await usernameElement.focus();
   await usernameElement.type(username);

   await utils.takeScreenshot(page, "addedSIPUsername.png");

   await utils.delay(1000);

   const secretElement = await page.$('#secret');

   if( !secretElement )
   {
      console.log("No secret element");
      return false;
   }

   await secretElement.click();

   await page.type('#secret', password);

   await utils.delay(1000);

   await utils.takeScreenshot(page, "inputtedPJSIPSettings.png");

   const sipServerElement = await page.$('#sip_server');
   if( !sipServerElement )
   {
      console.log("No SIP Server element");
      return false
   }

   await sipServerElement.focus();
   await sipServerElement.type(sipServer);

   await utils.takeScreenshot(page, "inputtedSIPServer.png");

   await page.click('#submit');

   await utils.delay(4000);

   await reload.reloadConfig( page );

   return true;
}

export async function addSIPTrunks(page)
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

   if( !(await addSIPTrunk(page, "Voip.ms", "chicago4.voip.ms", variables.trunknumber, variables.trunkaccount, variables.trunkpassword) ) ) {
      return false;
   }

   return true;
}


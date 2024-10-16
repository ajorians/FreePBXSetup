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

async function hasInboundRoute(page, did) {
   await page.waitForSelector('#didtable > tbody');

   const trunkRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#didtable tbody tr'));

      return rows.map(row => {
         const column = row.querySelectorAll('td')[2]; // Third column (0-based index)
         return column ? column.innerText.trim() : null;
      }).filter(text => text !== null);
   });

   for( const row of trunkRows ){
      //console.log("row: " + row);
      if( row == did ) {
         return true;
      }
   }

   return false;
}

async function addInboundRoute(page, did, description, destination)
{
   if( await hasInboundRoute(page, description) ){
      console.log("Has inbound route: " + description);
      return true;
   }

   const addInboundRouteButton = await getLinkWithText(page, "Add Inbound Route");
   await addInboundRouteButton.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addinboundroutes.png");

   const descriptionElement = await page.$('#description');

   if( !descriptionElement )
   {
      console.log("No description element");
      return false;
   }

   await descriptionElement.focus();
   await descriptionElement.type(description);

   await utils.delay(1000);

   const destinationElement = await page.$('#goto0');
   if( !destinationElement )
   {
      console.log("No destination element");
      return false;
   }

   await page.click( '#goto0' );
   await utils.delay(1000);

   await page.select( '#goto0', 'Extensions');

   const extensionsElement = await page.$('#Extensions0');
   if( !extensionsElement )
   {
      console.log("No extensions element");
      return false;
   }

   await page.click( '#Extensions0' );
   await utils.delay(1000);

   await page.select( '#Extensions0', destination);

   await page.click('#submit');

   await utils.delay(4000);

   await reload.reloadConfig( page );

   return true;
}

export async function addInboundRoutes(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   // Click Connectivity > Inbound Routes
   const connectivityLink = await getLinkWithText(page, 'Connectivity');
   connectivityLink.hover();

   await utils.takeScreenshot(page, "hoveredConnectivity.png");

   const inboundRoutesLink = await getLinkWithText(page, 'Inbound Routes');
   inboundRoutesLink.click();

   await utils.delay(4000);
 
   await utils.takeScreenshot(page, "inboundRoutes.png");

   if( !(await addInboundRoute(page, "5173480350", "From Voip.ms", "202 AJ Phone") ) ) {
      return false;
   }

   return true;
}


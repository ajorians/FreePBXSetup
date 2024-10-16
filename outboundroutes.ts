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

async function hasOutboundRoute(page, name) {
   await page.waitForSelector('#routes > tbody');

   const trunkRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#routes tbody tr'));

      return rows.map(row => {
         const column = row.querySelectorAll('td')[0]; // First column (0-based index)
         return column ? column.innerText.trim() : null;
      }).filter(text => text !== null);
   });

   for( const row of trunkRows ){
      //console.log("row: " + row);
      if( row == name ) {
         return true;
      }
   }

   return false;
}

async function addOutboundRoute(page, description)
{
   if( await hasOutboundRoute(page, description) ){
      console.log("Has outbound route: " + description);
      return true;
   }

   const addOutboundRouteButton = await getLinkWithText(page, "Add Outbound Route");
   await addOutboundRouteButton.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addoutboundroutes.png");

   const routeNameElement = await page.$('#routename');

   if( !routeNameElement )
   {
      console.log("No route name element");
      return false;
   }

   await routeNameElement.focus();
   await routeNameElement.type(description);

   await utils.delay(1000);

   const trunkElement = await page.$('#trunkpri0');
   if( !trunkElement )
   {
      console.log("No trunk element");
      return false;
   }

   await page.click( '#trunkpri0' );
   await utils.delay(1000);

   await page.select( '#trunkpri0', 'Voip.ms');

   await utils.delay(1000);

   await utils.takeScreenshot(page, "addedoutboundroute.png");

   const dialPatternsButton = await getLinkWithText(page, "Dial Patterns");
   await dialPatternsButton.click();

   await utils.delay(3000);

   await utils.takeScreenshot(page, "dialpatterns.png");

   const patternElement = await page.$('#pattern_pass_0');
   if( !patternElement )
   {
      console.log("No pattern element");
      return false;
   }

   await patternElement.focus();
   await patternElement.type('XXXXXXXXXX');

   await utils.delay(1000);

   await page.click('#submit');

   await utils.delay(4000);

   await reload.reloadConfig( page );

   return true;
}

export async function addOutboundRoutes(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   // Click Connectivity > Outbound Routes
   const connectivityLink = await getLinkWithText(page, 'Connectivity');
   connectivityLink.hover();

   await utils.takeScreenshot(page, "hoveredConnectivity.png");

   const outboundRoutesLink = await getLinkWithText(page, 'Outbound Routes');
   outboundRoutesLink.click();

   await utils.delay(4000);
 
   await utils.takeScreenshot(page, "outboundRoutes.png");

   if( !(await addOutboundRoute(page, "Through Voip.ms") ) ) {
      return false;
   }

   return true;
}


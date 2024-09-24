import * as utils from './utils.ts';
import * as buttons from './buttons.ts';
import * as login from './login.ts';
import * as reload from './reload.ts';

async function getLinkWithText(page, text) {
   const links = await page.$$('a'); // Find all links on the page

   for(const link of links) {
      const textContent = await link.evaluate(el => el.textContent.trim());
      //console.log("Link text: " + textContent);
      if( textContent.includes(text) ) {
         return link;
      }
   }

   return null;
}

async function hasRingGroup(page, groupNumber) {
   const ringGroupRows = await page.$$eval('#ringgroupgrid tr', (rows) => {
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells.map(cell => cell.innerText.trim()); // Extract text and trim whitespace
        });
    });

   for( const row of ringGroupRows ){
     const ringNumber = row[0];
     if( ringNumber == groupNumber ) {
         return true;
      }
   }

   return false;
}

async function addRingGroup(page, groupNumber, groupDescription, extensions)
{
   if( await hasRingGroup(page, groupNumber) ){
      console.log("Has ring group: " + groupNumber);
      return true;
   }

   const addRingGroupButton = await getLinkWithText(page, "Add Ring Group");
   await addRingGroupButton.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addringGroup.png");

   const ringGroupNumberElement = await page.$('input[type="text"][name="account"]');

   if( !ringGroupNumberElement )
   {
      console.log("No ring group number element");
      return false;
   }

   await ringGroupNumberElement.focus();
   await ringGroupNumberElement.type(groupNumber);

   const displayNameElement = await page.$('input[type="text"][name="description"]');

   if( !displayNameElement )
   {
      console.log("No display name element");
      return false;
   }

   await displayNameElement.focus();
   await displayNameElement.type(groupDescription);

   const extensionListElement = await page.$('#grplist');

   if( !extensionListElement )
   {
      console.log("No extension list element");
      return false;
   }

   await extensionListElement.focus();
   for( const ext of extensions ) {
      const extensionListElement = await page.$('#grplist');

      if( !extensionListElement )
      {
         console.log("No extension list element");
         return false;
      }

      await extensionListElement.focus();
      await extensionListElement.type(ext);
      await page.keyboard.press('Enter');

      await utils.delay(1000);
   }

   const destinationNoAnswerElement = await page.$('#goto0');
   if( !destinationNoAnswerElement )
   {
      console.log("No destination element");
      return false;
   }

   await page.click( '#goto0' );
   await utils.delay(1000);

   await page.select( '#goto0', 'Terminate_Call');

   await utils.takeScreenshot(page, "addedringgroup.png");

   await page.click('#submit');

   await reload.reloadConfig( page );

   return true;
}

export async function addRingGroups(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   // Click Applications > Ring Groups
   const applicationLink = await getLinkWithText(page, 'Applications');
   applicationLink.hover();

   await utils.takeScreenshot(page, "hoveredApplications.png");

   const ringGroupsLink = await getLinkWithText(page, 'Ring Groups');
   ringGroupsLink.click();

   await utils.delay(4000);
 
   await utils.takeScreenshot(page, "ringGroups.png");

   if( !await addRingGroup(page, "200", "Test Ring Group", ["201"]) ) {
      return false;
   }

   return true;
}


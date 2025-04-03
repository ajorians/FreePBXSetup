import * as utils from './utils.ts';
import * as buttons from './buttons.ts';
import * as login from './login.ts';
import * as reload from './reload.ts';
import * as variables from './variables.ts';

async function describeElementsByType(page, type) {
  // Get all elements of the specified type
  const elements = await page.$$(type);

  // Iterate over each element and gather its properties
  const elementDescriptions = [];
  for (const element of elements) {
    const description = {};

    // Extract relevant properties
    description.tagName = element.tagName;
    description.textContent = await element.evaluate(el => el.textContent);
    description.innerHTML = await element.evaluate(el => el.innerHTML);
    description.attributes = await element.evaluate(el => {
      const attributes = {};
      for (const attr of el.attributes) {
        attributes[attr.name] = attr.value;
      }
      return attributes;   

    });

    // Add any other desired properties
    // ...

    elementDescriptions.push(description);
  }

  return elementDescriptions;
}

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

async function hasSIPExtension(page, extensionNumber) {
   await page.waitForSelector('#table-all > tbody');

   const extensionRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#table-all tbody tr'));

      return rows.map(row => {
         const column = row.querySelectorAll('td')[1]; // Second column (0-based index)
         return column ? column.innerText.trim() : null;
      }).filter(text => text !== null);
   });

   for( const row of extensionRows ){
      if( row == extensionNumber ) {
         return true;
      }
   }

   return false;
}

async function addSIPExtension(page, extensionNumber, extensionName, extensionPassword)
{
   if( await hasSIPExtension(page, extensionNumber) ){
      console.log("Has extension: " + extensionNumber);
      return true;
   }

   const addExtButton = await buttons.getButtonsWithText(page, "Add Extension");
   await addExtButton.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addextensions.png");

   //const links = await describeElementsByType(page, 'a');
   //console.log(links);

   const addSIPExtensionLink = await getLinkWithText(page, 'Add New SIP [chan_pjsip] Extension');
   addSIPExtensionLink.click();

   await utils.delay(4000);

   await utils.takeScreenshot(page, "addsipextensions.png");

   const userExtensionElement = await page.$('input[type="text"][name="extension"]');

   if( !userExtensionElement )
   {
      console.log("No extension element");
      return false;
   }

   await userExtensionElement.focus();
   await userExtensionElement.type(extensionNumber);

   const displayNameElement = await page.$('input[type="text"][name="name"]');

   if( !displayNameElement )
   {
      console.log("No display name element");
      return false;
   }

   await displayNameElement.focus();
   await displayNameElement.type(extensionName);

   const secretElement = 'input[name=devinfo_secret]';
   if( !secretElement )
   {
      console.log("No secret element");
      return false;
   }

   await page.evaluate((selector, password) => {
    const textbox = document.querySelector(selector);
    if (textbox) {
      textbox.value = ''; // Clear existing text
      textbox.focus();
      textbox.value = password; // Type the new text
    }
    else
    {
      console.log("Not textbox");
    }
  }, secretElement, extensionPassword);

  await utils.delay(2000);

   await utils.takeScreenshot(page, "addedextensions.png");

   await page.click('#submit');

   await reload.reloadConfig( page );

   return true;
}

export async function addExtensions(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   // Click Connectivity > Extensions
   const connectivityLink = await getLinkWithText(page, 'Connectivity');
   connectivityLink.hover();

   await utils.takeScreenshot(page, "hoveredConnectivity.png");

   const extensionsLink = await getLinkWithText(page, 'Extensions');
   extensionsLink.click();

   await utils.delay(4000);
 
   await utils.takeScreenshot(page, "extensions.png");

   for( const deviceExt of variables.deviceextensions ){
      const number = deviceExt[0];
      const name = deviceExt[1];
      const password = deviceExt[2];

      console.log("Extension: " + number + " name: " + name + " password: " + password);
      if( !(await addSIPExtension(page, number, name, password) ) ) {
         console.log("Trouble adding extension");
         return false;
      }
   }

   return true;
}


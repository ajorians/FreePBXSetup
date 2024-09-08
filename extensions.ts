import * as utils from './utils.ts';
import * as login from './login.ts';

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
      const textContent = await link.evaluate(el => el.textContent);
      //console.log("Link text: " + textContent);
      if( textContent === text ) {
         return link;
      }
   }

   return null;
}

export async function addExtensions(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   //const links = await describeElementsByType(page, 'a');
   //console.log(links);

   // Click Connectivity > Extensions
   const connectivityLink = await getLinkWithText(page, 'Connectivity');
   connectivityLink.hover();

   await utils.takeScreenshot(page, "hoveredConnectivity.png");

   const extensionsLink = await getLinkWithText(page, 'Extensions');
   extensionsLink.click();

   await utils.delay(4000);
 
   await utils.takeScreenshot(page, "extensions.png");

   return true;
}


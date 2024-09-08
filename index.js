import puppeteer from 'puppeteer';
import * as utils from './utils.ts';
import * as login from './login.ts';
import * as settings from './settings.ts';

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

async function describeElement(page, element) {
   console.log("Describing element");

   if( !element )
   {
      console.log("Element is null");
      return;
   }
   const id = await element.evaluate(el => el.id);
   console.log("ID: '" + id + "'");

   const name = await element.evaluate(el => el.name);
   console.log("Name: " + name);

   const type = await element.evaluate(el => el.type);
   console.log("Type: " + type);

   const className = await element.evaluate(el => el.className);
   console.log("Class Name: " + className);

   const isVisible = await element.isVisible();
   console.log("IsVisible: " + isVisible);
}

async function scrollAndFindElement(page, selector) {
  const scrollIncrement = 100; // Adjust as needed
  let scrollPosition = 0;
  let elementFound = false;

  while (!elementFound && scrollPosition < page.evaluate(() => document.body.scrollHeight)) {
    await page.evaluate(y => window.scrollTo(0, y), scrollPosition);
    await page.waitFor(100); // Add a slight delay for the page to render

    const element = await page.$(selector);
    if (element) {
      elementFound = true;
      break;
    }

    scrollPosition += scrollIncrement;
  }

  return elementFound;
}

async function getLinksByText(page, text) {
  const links = await page.$$('a'); // Find all links on the page

  const matchingLinks = await page.evaluate((links, text) => {
    return links.filter(link => link.textContent.includes(text));
  }, links, text);

  return matchingLinks;
}

async function getLinksByClassAndText(page, className, text) {
  const links = await page.$$(className);

  console.log("Got links: " + links);
  for(const link of links) {
   console.log("link as textcontent: " + link.textContent);
  }

  const matchingLinks = await page.evaluate((links, text) => {
    return links.filter(link => link.textContent.includes(text));
  }, links, text);

  return matchingLinks;
}

async function getElementByTypeAndText(page, type, text) {
   // Get all elements of the specified type
   const elements = await page.$$(type);

   const matchingElements = await page.evaluate((elements, text) => {
    return elements.filter(element => element.textContent.includes(text));
  }, elements, text);

  return matchingElements;
}

async function addExtensions(page)
{
   if( !(await login.isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   //const links = await describeElementsByType(page, 'a');
   //console.log(links);

   // Click Connectivity > Extensions
   const connectivityLink = await getElementByTypeAndText(page, 'a', 'Connectivity')[0];
   await describeElement(page, connectivityLink);
   await page.hover(connectivityLink);

   await utils.takeScreenshot(page, "hoveredConnectivity.png");

   const extensionsLink = await getElementByTypeAndText(page, 'a', 'Extensions')[0];
   await describeElement(page, extensionsLink);
   await page.click(extensionsLink);

   await utils.delay(1000);
 
   await utils.takeScreenshot(page, "extensions.png");

   return true;

//   const connectivityelement = await page.waitForSelector('#fpbx-menu-collapse > ul > li:nth-child(3)');
//   await page.hover('#fpbx-menu-collapse > ul > li:nth-child(3)');

//   await takeScreenshot(page, "hoveredConnectivity.png");

//   await page.waitForSelector('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');
//   await page.hover('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');

//   await page.screenshot({
//     path: '/srv/www/htdocs/allwrite/hoveredExtensions.png',
//   });

//   await page.click('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');

//   await takeScreenshot(page, "clickedExtensions.png");

//   await page.waitForSelector('#bt-add-ex > button');
//   await page.click('#bt-add-ex > button');

//   await takeScreenshot(page, "hoveredAddExtension.png");

//   await page.waitForSelector('#bt-add-ex > ul > li:nth-child(1) > a > strong');
//   await page.click('#bt-add-ex > ul > li:nth-child(1) > a > strong');

//   await takeScreenshot(page, "clickedAddNewSipExtension.png");

//   return true;
}

async function setupFreePBX() {
   const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium'});

   const page = await browser.newPage();

   await page.setViewport({
       width: 1920,
       height: 1080
     });

   await page.goto('https://asteriskpi.orians.org/');

   console.log("Navigating to FreePBX site");

   if( !(await login.loginToSite(page, 'admin', 'changemeaj') ) ){
      console.log("Logging in failed");
      return;
   }

   console.log("Logging in successful");

   if( !(await settings.configureSettings(page) ) ){
      console.log("Setting configuration failed");
      return;
   }

   console.log("Setting configuration successful");

   if( !(await addExtensions(page) ) ){
      console.log("Adding extension failed");
      return;
   }

   console.log("Adding extensions successful");

   await browser.close();
}

await setupFreePBX();

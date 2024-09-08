import puppeteer from 'puppeteer';

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function getByText(page, text) {
  const elements = await page.$$('*');
  for (const element of elements) {
    const elementText = await element.evaluate(el => el.textContent);
    if (elementText === text) {
      return element;
    }
  }
  return null; // Element not found
}

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

async function takeScreenshot(page, filename) {
   if( !page ) {
      console.log("Page is NULL.  Cannot continue");
      return;
   }

   const path = "/srv/www/htdocs/allwrite/";
   const screenshotPath = path + filename;

   console.log("Taking screenshot: " + screenshotPath);

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/checkingLoggedIn.png',
   });
}

async function moveMouseToCenter(page) {
  // Get the dimensions of the viewport
  const viewportDimensions = await page.evaluate(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  // Calculate the center coordinates
  const centerX = viewportDimensions.width / 2;
  const centerY = viewportDimensions.height / 2;

  // Move the mouse to the center
  await page.mouse.move(centerX, centerY);
}

async function findTextStartingWith(page, prefix) {
  const elements = await page.evaluate((prefix) => {
    const textElements = document.querySelectorAll('*');
    return Array.from(textElements)
      .filter(el => el.textContent.startsWith(prefix))
      .map(el => el.textContent);
  }, prefix);

  return elements;
}

function getRemainderAfterPrefix(string, prefix) {
  if (string.startsWith(prefix)) {
    return string.slice(prefix.length);
  } else {
    return string;
  }
}

async function isLoggedIn(page) {
   if( !page ) {
      console.log("Page is NULL.  Cannot continue");
      return false;
   }

   await takeScreenshot(page, "checkingLoggedIn.png");

   await moveMouseToCenter(page);
   await delay(1000);

   //const buttonDescriptions = await describeElementsByType(page, 'button');
   //console.log(buttonDescriptions);

   const gearSelector = '#settings-cog';
   await page.waitForSelector(gearSelector);
   await page.hover(gearSelector);
   //await page.click(gearSelector);

   const textElements = await findTextStartingWith(page, 'Hello,');
   //console.log(textElements);  

   for (const textElement of textElements) {
      const username = getRemainderAfterPrefix(textElement, "Hello, ");
      console.log("Logged in as: " + username);
      return true;
   }
 
   return false;
}

async function login(page, username, password){
   // Get the FreePBX Administration text
   const administrationTextElement = await getByText(page, 'FreePBX Administration');
   const textContent = await page.evaluate(el => el.textContent.trim(), administrationTextElement);
   console.log("Label text: " + textContent);

   // Click FreePBX Administration button to login
   await page.click('#login_admin');

   await delay(1000);

   await takeScreenshot(page, "clickedLogin.png");

   const usernameElement = await page.$('input[type="text"][name="username"]');

   //await describeElement(page, usernameElement);

   if( !usernameElement )
   {
      console.log("No username element");
      return false;
   }

   await usernameElement.focus();
   await usernameElement.type(username);

   await page.type('xpath//html/body/div[15]/div[2]/form/div[2]/input', password);

   await takeScreenshot(page, "enteredCredentials.png");

   page.keyboard.press('Enter');

   await delay(10000);//10 seconds

   return await isLoggedIn(page);
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

async function configureSettings(page)
{
   if( !(await isLoggedIn(page) ) ){
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

   await delay(10000); //10 seconds

   await takeScreenshot(page, "advancedSettings.png");

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

async function addExtensions(page)
{
   if( !(await isLoggedIn(page) ) ){
      console.log("Not logged in");
      return false;
   }

   // Click Connectivity > Extensions
   const connectivityelement = await page.waitForSelector('#fpbx-menu-collapse > ul > li:nth-child(3)');
   await page.hover('#fpbx-menu-collapse > ul > li:nth-child(3)');

   await takeScreenshot(page, "hoveredConnectivity.png");

   await page.waitForSelector('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');
   await page.hover('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/hoveredExtensions.png',
   });

   await page.click('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');

   await takeScreenshot(page, "clickedExtensions.png");

   await page.waitForSelector('#bt-add-ex > button');
   await page.click('#bt-add-ex > button');

   await takeScreenshot(page, "hoveredAddExtension.png");

   await page.waitForSelector('#bt-add-ex > ul > li:nth-child(1) > a > strong');
   await page.click('#bt-add-ex > ul > li:nth-child(1) > a > strong');

   await takeScreenshot(page, "clickedAddNewSipExtension.png");

   return true;
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

   if( !(await login(page, 'admin', 'changemeaj') ) ){
      console.log("Logging in failed");
      return;
   }

   console.log("Logging in successful");

   if( !(await configureSettings(page) ) ){
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

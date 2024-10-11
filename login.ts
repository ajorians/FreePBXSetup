import * as utils from './utils.ts';

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

export async function isLoggedIn(page) {
   if( !page ) {
      console.log("Page is NULL.  Cannot continue");
      return false;
   }

   await utils.takeScreenshot(page, "checkingLoggedIn.png");

   await moveMouseToCenter(page);
   await utils.delay(1000);

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

export async function loginToSite(page, username, password){
   // Get the FreePBX Administration text
   const administrationTextElement = await getByText(page, 'FreePBX Administration');
   const textContent = await page.evaluate(el => el.textContent.trim(), administrationTextElement);
   console.log("Label text: " + textContent);

   // Click FreePBX Administration button to login
   await page.click('#login_admin');

   await utils.delay(1000);

   await utils.takeScreenshot(page, "clickedLogin.png");

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

   await utils.takeScreenshot(page, "enteredCredentials.png");

   await page.keyboard.press('Enter');

   await utils.delay(10000);//10 seconds

   return await isLoggedIn(page);
}


import * as utils from './utils.ts';

async function checkForText(page, textToFind) {
  // Check if the text exists on the page
  const pageText = await page.evaluate(() => {
    return document.body.innerText; 
  });

  const textExists = pageText.includes(textToFind);

  return textExists;
}

export async function isAtInitialSetup(page) {
   if( !page ) {
      console.log("Page is NULL for initial setup.  Cannot continue");
      return false;
   }

   await utils.takeScreenshot(page, "checkingInitialSetup.png");

   await utils.delay(1000);

   return await checkForText(page, 'Initial Setup');
}

export async function isAtDefaultLocales(page) {
   if( !page ) {
      console.log("Page is NULL for default locales.  Cannot continue");
      return false;
   }

   await utils.takeScreenshot(page, "checkingDefaultLocales.png");

   await utils.delay(1000);

   return await checkForText(page, 'Please Select the default locales of the PBX');
}

export async function setup(page, username, password, email, systemIdentifier) {
   await utils.delay(1000);

   const usernameElement = await page.$('#username');

   if( !usernameElement )
   {
      console.log("No username element");
      return false;
   }

   await usernameElement.focus();
   await usernameElement.type(username);

   const password1Element = await page.$('#password1');

   if( !password1Element )
   {
      console.log("No password1 element");
      return false;
   }

   await password1Element.focus();
   await password1Element.type(password);

   const password2Element = await page.$('#password2');

   if( !password2Element )
   {
      console.log("No password2 element");
      return false;
   }

   await password2Element.focus();
   await password2Element.type(password);

   const emailElement = await page.$('#email');

   if( !emailElement )
   {
      console.log("No email element");
      return false;
   }

   await emailElement.focus();
   await emailElement.type(email);

   const systemIDElement = await page.$('#system_ident');

   if( !systemIDElement )
   {
      console.log("No system identifier element");
      return false;
   }

   await systemIDElement.focus();
   await systemIDElement.type(systemIdentifier);

   await page.click('#createacct');

   await utils.delay(4000);

   return true;
}

export async function setupDefaultLocales(page) {
   await utils.delay(1000);

   await page.click('#submitOobe');

   await utils.delay(4000);

   return true;
}

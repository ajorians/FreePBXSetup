import puppeteer from 'puppeteer';

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function isLoggedIn(page) {
   const gearSelector = '#settings-cog';
   await page.waitForSelector(gearSelector);
   await page.hover(gearSelector);
   await page.click(gearSelector);
   
   const loginSelector = '#page > div.freepbx-navbar > nav > ul > li.dropdown.admin-btn.show > ul > li:nth-child(1) > a';
   await page.waitForSelector(loginSelector);
   await page.hover(loginSelector);
   const welcomeTextElement = await page.$(loginSelector);
   const textLogin = await page.evaluate(el => el.textContent.trim(), welcomeTextElement);

   console.log("WelcomeText: " + textLogin);
   return textLogin.includes('Hello,');
}

async function login(page, username, password){
   // Get the FreePBX Administration text
   await page.waitForSelector('#login_icon_holder > div:nth-child(1) > span');
   const administrationTextElement = await page.$('#login_icon_holder > div:nth-child(1) > span');
   const textContent = await page.evaluate(el => el.textContent.trim(), administrationTextElement);
   console.log("Label text: " + textContent);

   // Click FreePBX Administration button to login
   await page.click('#login_admin');
   await page.waitForSelector('input[name="username"]');
   await delay(1000);
   await page.type('input[name="username"]', username);
   await page.type('xpath//html/body/div[15]/div[2]/form/div[2]/input', password);

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/enteredlogin.png',
   })

   page.keyboard.press('Enter');

   await delay(10000);//10 Seconds

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/loggedin.png',
   });

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

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/hoveredConnectivity.png',
   });

   await page.waitForSelector('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');
   await page.hover('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/hoveredExtensions.png',
   });

   await page.click('#fpbx-menu-collapse > ul > li:nth-child(3) > ul > li:nth-child(2) > a');

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/clickedExtensions.png',
   });

   await page.waitForSelector('#bt-add-ex > button');
   await page.click('#bt-add-ex > button');

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/hoveredAddExtension.png',
   });

   await page.waitForSelector('#bt-add-ex > ul > li:nth-child(1) > a > strong');
   await page.click('#bt-add-ex > ul > li:nth-child(1) > a > strong');

   await page.screenshot({
     path: '/srv/www/htdocs/allwrite/clickedAddNewSipExtension.png',
   });

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

   if( !(await addExtensions(page) ) ){
      console.log("Adding extension failed");
   }

   console.log("Adding extensions successful");

   await browser.close();
}

await setupFreePBX();

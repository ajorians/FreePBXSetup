import puppeteer from 'puppeteer';
import * as utils from './utils.ts';
import * as initialsetup from './initialsetup.ts';
import * as login from './login.ts';
import * as extensions from './extensions.ts';
import * as ringgroups from './ringgroups.ts';
import * as settings from './settings.ts';
import * as siptrunks from './siptrunks.ts';
import * as inboundroutes from './inboundroutes.ts';
import * as outboundroutes from './outboundroutes.ts';
import * as iaxsettings from './iaxsettings.ts';
import * as variables from './variables.ts';
import * as fs from 'fs';

async function getBrowerPath() {
   const chromePath = "/usr/bin/google-chrome";
   if( fs.existsSync( chromePath ) ){
      console.log("Using Chrome");
      return chromePath;
   }
   const chromiumPath = "/usr/bin/chromium";
   if( fs.existsSync( chromiumPath ) ){
      console.log("Using Chromium");
      return chromiumPath;
   }

   console.log("Unable to find a suitable browser");
   return "";
}

async function setupFreePBX() {
   const browserPath = await getBrowerPath();

   const browser = await puppeteer.launch({executablePath: browserPath});

   const page = await browser.newPage();

   await page.setViewport({
       width: 1920,
       height: 1080
     });

   await page.goto(variables.server);

   console.log("Navigating to FreePBX site");

   if( await initialsetup.isAtInitialSetup(page) ) {
      console.log("Initial setup");
      if( await initialsetup.setup(page, variables.username, variables.password, "ajorians@gmail.com", "Asterisk PI") ) {
         console.log("Setup successful");
      } else {
         console.log("Setup failed");
      }
   }

   if( !(await login.loginToSite(page, variables.username, variables.password) ) ){
      console.log("Logging in failed");
      return;
   }

   console.log("Logging in successful");

   if( await initialsetup.isAtDefaultLocales(page) ) {
      console.log("DefaultLocales");
      if( await initialsetup.setupDefaultLocales(page) ) {
         console.log("Setup Default Locales Successful");
      } else {
         console.log("Setup Default Locales Failed");
      }
      return;
   }

//   if( !(await settings.configureSettings(page) ) ){
//      console.log("Setting configuration failed");
//      return;
//   }

//   console.log("Setting configuration successful");

   console.log("Adding extensions");

   if( !(await iaxsettings.configureIAXSettings(page) ) ){
      console.log("Configuring IAX settings failed");
      return;
   }

   if( !(await extensions.addExtensions(page) ) ){
      console.log("Adding extension failed");
      return;
   }

   console.log("Adding extensions successful");

   console.log("Adding ring groups");

   if( !(await ringgroups.addRingGroups(page) ) ){
      console.log("Adding ring groups failed");
      return;
   }

   console.log("Adding ring groups successful");

   console.log("Adding SIP Trunks");

   if( !(await siptrunks.addSIPTrunks(page) ) ){
      console.log("Adding SIP trunks failed");
      return;
   }

   console.log("Adding SIP trunks successful");

   console.log("Addding inbound routes");

   if( !(await inboundroutes.addInboundRoutes(page) ) ){
      console.log("Adding Inbound Routes failed");
      return;
   }

   console.log("Adding Inbound Routes successful");

   console.log("Adding outbound routes");

   if( !(await outboundroutes.addOutboundRoutes(page) ) ){
      console.log("Adding Outbound Routes failed");
      return;
   }

   console.log("Adding Outbound Routes successful");

   await browser.close();
}

await setupFreePBX();

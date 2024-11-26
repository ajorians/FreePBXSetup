import puppeteer from 'puppeteer';
import * as utils from './utils.ts';
import * as login from './login.ts';
import * as extensions from './extensions.ts';
import * as ringgroups from './ringgroups.ts';
import * as settings from './settings.ts';
import * as siptrunks from './siptrunks.ts';
import * as inboundroutes from './inboundroutes.ts';
import * as outboundroutes from './outboundroutes.ts';
import * as variables from './variables.ts';

async function setupFreePBX() {
   const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium'});

   const page = await browser.newPage();

   await page.setViewport({
       width: 1920,
       height: 1080
     });

   await page.goto(variables.server);

   console.log("Navigating to FreePBX site");

   if( !(await login.loginToSite(page, variables.user, variables.password) ) ){
      console.log("Logging in failed");
      return;
   }

   console.log("Logging in successful");

//   if( !(await settings.configureSettings(page) ) ){
//      console.log("Setting configuration failed");
//      return;
//   }

//   console.log("Setting configuration successful");

   if( !(await extensions.addExtensions(page) ) ){
      console.log("Adding extension failed");
      return;
   }

   console.log("Adding extensions successful");

   if( !(await ringgroups.addRingGroups(page) ) ){
      console.log("Adding ring groups failed");
      return;
   }

   console.log("Adding ring groups successful");

   if( !(await siptrunks.addSIPTrunks(page) ) ){
      console.log("Adding SIP trunks failed");
      return;
   }

   console.log("Adding SIP trunks successful");

   if( !(await inboundroutes.addInboundRoutes(page) ) ){
      console.log("Adding Inbound Routes failed");
      return;
   }

   console.log("Adding Inbound Routes successful");

   if( !(await outboundroutes.addOutboundRoutes(page) ) ){
      console.log("Adding Outbound Routes failed");
      return;
   }

   console.log("Adding Outbound Routes successful");

   await browser.close();
}

await setupFreePBX();

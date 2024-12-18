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
   const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});

   const page = await browser.newPage();

   await page.setViewport({
       width: 1920,
       height: 1080
     });

   await page.goto(variables.server);

   console.log("Navigating to FreePBX site");

   if( !(await login.loginToSite(page, variables.username, variables.password) ) ){
      console.log("Logging in failed");
      return;
   }

   console.log("Logging in successful");

//   if( !(await settings.configureSettings(page) ) ){
//      console.log("Setting configuration failed");
//      return;
//   }

//   console.log("Setting configuration successful");

   console.log("Adding extensions");

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

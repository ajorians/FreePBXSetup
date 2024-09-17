import * as utils from './utils.ts';
import * as buttons from './buttons.ts';

export async function reloadConfig(page) {
   await utils.delay(2000);

   if( !page ) {
      console.log("Page is NULL.  Cannot continue");
      return;
   }

   await page.click('#button_reload');

   await utils.delay(10000);
}


export async function getButtonsWithText(page, text) {
  const buttons = await page.$$('button'); // Use the appropriate selector for your case

  // Filter and click the button based on its text content
  for (let button of buttons) {
    const buttonText = await page.evaluate(el => el.textContent.trim(), button);
    //console.log("ButtonText: " + buttonText);
    if (buttonText.includes( text )) { // Replace with the text you're looking for
      return button;
    }
  }

  return null;
}


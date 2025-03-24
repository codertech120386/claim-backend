const BrowserSessionManager = require('./BrowserSessionManager');
const sessionMap = new Map(); // Maps internalUserId to browser instances

const browserSessionManager = new BrowserSessionManager();

async function handleLogin(internalUserId, mobile) {
  const { browser, page } = await browserSessionManager.setupBrowser();

  console.log('inside umang handle login');
  try {
    await page.goto('https://web.umang.gov.in/web_new/login', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Select the Login with Otp button
    const loginWithOtpButton = await page.$(
      '.btn.alternate_btn.w-100.d-flex.justify-content-center.align-items-center'
    );

    if (loginWithOtpButton) {
      console.log('*********');
      console.log('loginWithOtpButton', loginWithOtpButton);
      console.log('*********');
      // You can interact with the button, e.g., click it:
      await loginWithOtpButton.click();
    } else {
      console.log('loginWithOtpButton not found');
    }

    await page.type('#mat-input-0', mobile);

    // Select the Send Otp button
    const sendOtpButton = await page.$(
      '.btn.w-100.d-flex.justify-content-center.align-items-center'
    );

    if (sendOtpButton) {
      // You can interact with the sendOtpButton, e.g., click it:
      await sendOtpButton.click();

      // if (browser) {
      //   console.log('*********');
      //   console.log('reached success');
      //   console.log('*********');
      //   setTimeout(() => {
      //     browser.close();
      //   }, 2000);
      // }

      return {
        success: true,
        message: 'Login successful',
        data: {
          session: {
            browser,
            page,
            mobile,
            internalUserId,
          },
        },
      };
    } else {
      console.error('sendOtpButton not found');

      if (browser) {
        console.log('*********');
        console.log('reached failure');
        console.log('*********');
        setTimeout(() => {
          browser.close();
        }, 2000);
      }

      return {
        success: false,
        message: 'Login insuccessful',
        data: {
          session: {
            browser,
            page,
            mobile,
            internalUserId,
          },
        },
      };
    }
  } catch (e) {
    console.error(`following error occured: ${e}`);
    return {
      success: false,
      message: 'Login insuccessful',
      data: {
        session: {
          browser,
          page,
          mobile,
          internalUserId,
        },
      },
    };
  }
}

async function handleOTP(mobile, internalUserId, otp) {
  const { browser, page } = await browserSessionManager.setupBrowser();

  sessionMap.set(internalUserId, { browser, page });

  console.log('inside umang handle login');
  console.log('*********');
  console.log('internalUserId', internalUserId);
  console.log('*********');
  try {
    await page.goto('https://web.umang.gov.in/web_new/login', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Select the Login with Otp button
    const loginWithOtpButton = await page.$(
      '.btn.alternate_btn.w-100.d-flex.justify-content-center.align-items-center'
    );

    if (loginWithOtpButton) {
      console.log('*********');
      console.log('loginWithOtpButton', loginWithOtpButton);
      console.log('*********');
      // You can interact with the button, e.g., click it:
      await loginWithOtpButton.click();
    } else {
      console.log('loginWithOtpButton not found');
    }

    await page.type('#mat-input-0', mobile);

    // Select the Send Otp button
    const sendOtpButton = await page.$(
      '.btn.w-100.d-flex.justify-content-center.align-items-center'
    );

    if (sendOtpButton) {
      // You can interact with the sendOtpButton, e.g., click it:
      await sendOtpButton.click();

      await page.waitForSelector('div.mt20 .btn', { visible: true });

      // Get all button elements and filter by text content
      const buttons = await page.$$('button'); // Get all buttons

      for (let button of buttons) {
        const text = await page.evaluate((el) => el.textContent, button); // Get text content of each button
        console.log('*********');
        console.log('text', text);
        console.log('*********');
        if (text.includes('Close')) {
          console.log('Close Button found!');
          await button.click(); // Click the button if the text matches
          break;
        }
      }

      await page.waitForSelector(
        'div.ng-otp-input-wrapper.wrapper.ng-star-inserted',
        { visible: true }
      );

      const otpFields = await page.$$(
        'div.ng-otp-input-wrapper.wrapper.ng-star-inserted input'
      );
      console.log('*********');
      console.log('otpFields', otpFields);
      console.log('*********');
      for (let i = 0; i < otp.length; i++) {
        if (otpFields[i]) {
          await otpFields[i].type(otp[i]);
        }
      }

      // Select the Verify Otp button
      // Get all button elements and filter by text content
      // const buttons = await page.$$('button'); // Get all buttons

      for (let button of buttons) {
        const text = await page.evaluate((el) => el.textContent, button); // Get text content of each button
        console.log('*********');
        console.log('text', text);
        console.log('*********');
        if (text.includes('Verify')) {
          console.log('*********');
          console.log('Verify Button found!');
          console.log('*********');
          await button.click(); // Click the button if the text matches
          break;
        }
      }
      const response = await page.waitForResponse(
        (response) =>
          response.url().includes('/web_new/home') && response.status() === 200
      );
      verifyOtpResponse = await response.json();

      console.log('*********');
      console.log('verifyOtpResponse', verifyOtpResponse);
      console.log('*********');

      return {
        status: 200,
        message: 'OTP submitted successfully.',
        mobile,
        internalUserId,
      };
    }
  } catch (error) {
    return {
      status: 400,
      message: 'Invalid OTP, please resend OTP & try again...',
      error: error?.message || `No message found in ${error}`,
      mobile,
      internalUserId,
    };
  }
}

module.exports = { handleLogin, handleOTP };

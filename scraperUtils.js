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

async function navigateToEPFOAndRaiseClaim(internalUserId) {
  try {
    const session = sessionMap.get(internalUserId);
    if (!session) {
      throw new Error('No active session found');
    }

    const { page } = session;

    // Wait for the EPFO card element and click it
    await page.waitForSelector('.cardsubheader.m-0.theme-switch-color', {
      visible: true,
      timeout: 30000
    });

    // Find the specific EPFO card by checking its text content
    const elements = await page.$$('.cardsubheader.m-0.theme-switch-color');
    let epfoElement = null;
    
    for (const element of elements) {
      const text = await page.evaluate(el => el.textContent, element);
      if (text.includes('Social Security & Pensioners')) {
        epfoElement = element;
        break;
      }
    }

    if (!epfoElement) {
      throw new Error('EPFO card not found');
    }

    // Click the parent card element
    const cardElement = await page.evaluateHandle(el => 
      el.closest('.card-info.theme-switch-card'), epfoElement);
    await cardElement.click();

    // Wait for URL to change and contain 'dept'
    await page.waitForFunction(
      'window.location.href.includes("dept")',
      { timeout: 30000 }
    );

    // Wait for Raise Claim element to be visible
    await page.waitForSelector('text/Raise Claim', {
      visible: true,
      timeout: 30000
    });

    // Find and click the Raise Claim option
    const raiseClaim = await page.$x("//div[contains(text(), 'Raise Claim')]");
    if (raiseClaim.length > 0) {
      await raiseClaim[0].click();
    } else {
      throw new Error('Raise Claim option not found');
    }

    return {
      status: 200,
      message: 'Successfully navigated to Raise Claim',
      success: true
    };

  } catch (error) {
    console.error('Navigation error:', error);
    return {
      status: 400,
      message: 'Failed to navigate to Raise Claim',
      error: error.message,
      success: false
    };
  }
}

async function sendOTP(internalUserId, mobile) {
  try {
    const { browser, page } = await browserSessionManager.setupBrowser();
    sessionMap.set(internalUserId, { browser, page });
    
    await page.goto('https://web.umang.gov.in/web_new/login', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Click Login with OTP button
    await page.waitForSelector('.btn.alternate_btn.w-100.d-flex.justify-content-center.align-items-center', {
      visible: true,
      timeout: 30000
    });
    await page.click('.btn.alternate_btn.w-100.d-flex.justify-content-center.align-items-center');

    // Enter mobile number
    await page.waitForSelector('#mat-input-0', { visible: true });
    await page.type('#mat-input-0', mobile);

    // Click Send OTP button
    await page.waitForSelector('.btn.w-100.d-flex.justify-content-center.align-items-center', {
      visible: true
    });
    await page.click('.btn.w-100.d-flex.justify-content-center.align-items-center');

    // Wait for any popup message or registration form
    try {
      // First check for any popup message
      const popup = await page.waitForSelector('.mesg-popup .common-data', {
        visible: true,
        timeout: 5000
      });

      if (popup) {
        const popupText = await page.evaluate(el => el.textContent.trim(), popup);
        
        // Check if it's the not registered message
        if (popupText.includes('mobile number is not registered') || 
            popupText.includes('New User section')) {
          
          // Click the close button
          await page.waitForSelector('.mesg-popup .mt20 .btn', {
            visible: true,
            timeout: 5000
          });
          await page.click('.mesg-popup .mt20 .btn');

          // Clean up session
          await browser.close();
          sessionMap.delete(internalUserId);

          return {
            success: false,
            message: 'User not registered. Please complete registration process first.',
            requiresRegistration: true,
            error: 'Registration required'
          };
        }

        // If it's the OTP sent success message
        if (popupText.includes('OTP has been generated')) {
          // Click the close button
          await page.waitForSelector('.mesg-popup .mt20 .btn', {
            visible: true,
            timeout: 5000
          });
          await page.click('.mesg-popup .mt20 .btn');

          // Wait for OTP input form
          await page.waitForSelector('.ng-otp-input-wrapper.wrapper.ng-star-inserted', {
            visible: true,
            timeout: 30000
          });

          return {
            success: true,
            message: 'OTP sent successfully',
            data: { mobile, internalUserId }
          };
        }
      }
    } catch (timeoutError) {
      // If no popup, check for registration form
      try {
        const registrationForm = await page.waitForSelector('mat-card.auth-card .headings strong', {
          visible: true,
          timeout: 5000
        });

        if (registrationForm) {
          const headingText = await page.evaluate(el => el.textContent.trim(), registrationForm);
          
          if (headingText.includes('Sign Up')) {
            // Clean up session
            await browser.close();
            sessionMap.delete(internalUserId);

            return {
              success: false,
              message: 'User not registered. Please register first before logging in.',
              requiresRegistration: true,
              error: 'Registration required'
            };
          }
        }
      } catch (regFormError) {
        throw new Error('Unable to determine registration status');
      }
    }

  } catch (error) {
    // Clean up session if error occurs
    const session = sessionMap.get(internalUserId);
    if (session?.browser) {
      await session.browser.close();
    }
    sessionMap.delete(internalUserId);
    
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

async function verifyOTP(internalUserId, otp) {
  try {
    const session = sessionMap.get(internalUserId);
    if (!session) {
      throw new Error('No active session found');
    }

    const { page, browser } = session;

    // Wait for OTP input fields
    await page.waitForSelector('.ng-otp-input-wrapper.wrapper.ng-star-inserted input', {
      visible: true,
      timeout: 30000
    });

    // Get all OTP input fields
    const otpInputs = await page.$$('.ng-otp-input-wrapper.wrapper.ng-star-inserted input');

    // Enter OTP digits one by one
    for (let i = 0; i < otp.length && i < otpInputs.length; i++) {
      await otpInputs[i].type(otp[i]);
    }

    // Wait for Verify OTP button to be enabled
    await page.waitForSelector('.btn.w-100.d-flex.justify-content-center.align-items-center:not([disabled])', {
      visible: true,
      timeout: 30000
    });

    // Click Verify OTP button
    await page.click('.btn.w-100.d-flex.justify-content-center.align-items-center');

    // Wait for either success navigation OR error popup
    try {
      // Wait for potential error popup
      const errorPopup = await page.waitForSelector('.mesg-popup .common-data', {
        visible: true,
        timeout: 5000
      });

      if (errorPopup) {
        const errorMessage = await page.evaluate(el => el.textContent.trim(), errorPopup);
        
        // If error message contains invalid OTP text
        if (errorMessage.includes('invalid OTP')) {
          // Click the close button
          await page.waitForSelector('.mesg-popup .mt20 .btn', {
            visible: true,
            timeout: 5000
          });
          await page.click('.mesg-popup .mt20 .btn');

          // Clean up the session
          await browser.close();
          sessionMap.delete(internalUserId);

          return {
            status: 400,
            message: 'Invalid OTP provided',
            error: errorMessage,
            success: false
          };
        }
      }
    } catch (timeoutError) {
      // If no error popup appears, check for successful navigation
      await page.waitForNavigation({ 
        timeout: 30000,
        waitUntil: 'networkidle0'
      });
      
      return {
        status: 200,
        message: 'OTP verified successfully',
        success: true
      };
    }

  } catch (error) {
    // Clean up session on any other error
    const session = sessionMap.get(internalUserId);
    if (session?.browser) {
      await session.browser.close();
    }
    sessionMap.delete(internalUserId);

    return {
      status: 400,
      message: 'OTP verification failed',
      error: error.message,
      success: false
    };
  }
}

module.exports = {sendOTP, verifyOTP, handleLogin, handleOTP,navigateToEPFOAndRaiseClaim };


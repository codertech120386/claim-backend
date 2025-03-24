const uuid = require('uuid');

const { handleLogin, handleOTP, navigateToEPFOAndRaiseClaim, verifyOTP, sendOTP } = require('./scraperUtils');

const BrowserSessionManager = require('./BrowserSessionManager');
const sessionManager = new BrowserSessionManager();


exports.startSession = async (req, res) => {
  if (process.env.MODE === 'dummy') {
    return res.status(200).json({
      message: 'OTP sent successfully',
      otpRequired: true,
      internalUserId: '008941fb-7726-47bf-ab29-19ad1ede1727',
    });
  }

  const { mobile } = req.body;
  const internalUserId = uuid.v4();

  try {
    const result = await sendOTP(internalUserId, mobile);
    
    if (!result.success) {
      if (result.requiresRegistration) {
        return res.status(403).json({
          message: result.message,
          requiresRegistration: true,
          error: result.error
        });
      }
      
      return res.status(400).json({
        message: result.message,
        error: result.error
      });
    }

    res.status(200).json({
      message: result.message,
      otpRequired: true,
      internalUserId,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to start session',
      error: error.message,
      internalUserId,
    });
  }
};

exports.submitOTP = async (req, res) => {
  if (process.env.MODE === 'dummy') {
    return res.status(200).json({
      message: 'OTP verified successfully',
      internalUserId: req.body.internalUserId,
    });
  }

  const { internalUserId, otp } = req.body;

  try {
    const result = await verifyOTP(internalUserId, otp);
    
    if (!result.success) {
      return res.status(result.status).json({
        message: result.message,
        error: result.error,
        success: false
      });
    }

    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'OTP verification failed',
      error: error.message,
      success: false,
      internalUserId,
    });
  }
};

// exports.startSession = async (req, res) => {
//   if (process.env.MODE === 'dummy') {
//     return res.status(200).json({
//       message:
//         'Login successful, OTP is sent to your Mobile Number : XXXXXX5610',
//       otpRequired: true,
//       internalUserId: '008941fb-7726-47bf-ab29-19ad1ede1727',
//     });
//   }

//   const { mobile } = req.body;
//   const internalUserId = uuid.v4();
//   let isLoginSuccessful = false;

//   try {
//     const { loginResponse } = await loginUser(internalUserId, mobile);

//     if (loginResponse.success) {
//       isLoginSuccessful = true;
//       res.status(200).json({
//         otpRequired: true,
//         internalUserId,
//       });
//     } else {
//       res.status(loginResponse.status).json({
//         message: loginResponse.message,
//         internalUserId: internalUserId,
//       });
//     }
//   } catch (error) {
//     console.log('*********');
//     console.log('error', error);
//     console.log('*********');
//     res.status(500).json({
//       message: 'An error occurred during the login process.',
//       error: error.message,
//       internalUserId,
//     });
//   } finally {
//     if (!isLoginSuccessful) {
//       await sessionManager.closeSession(internalUserId);
//       console.log('Session deleted due to unsuccessful login.');
//     }
//   }
// };

const loginUser = async (internalUserId, mobile) => {
  console.log('Going to login user ');
  console.log('mobile : ' + mobile);

  const loginResponse = await handleLogin(internalUserId, mobile);

  return { loginResponse };
};

// exports.submitOTP = async (req, res) => {
//   if (process.env.MODE === 'dummy') {
//     return res.status(200).send({
//       message: 'OTP submitted successfully.',
//       internalUserId: req.body.internalUserId,
//     });
//   }

//   const { internalUserId, otp, mobile } = req.body;
//   try { 
//     const result = await handleOTP(mobile, internalUserId, otp);
//     return res.status(result?.status).send({
//       message: result?.message,
//       internalUserId,
//     });
//   } catch (error) {
//     return res.status(500).send({
//       message: error.message,
//       internalUserId,
//     });
//   }
// };


exports.raiseClaim = async (req, res) => {
  if (process.env.MODE === 'dummy') {
    return res.status(200).json({
      message: 'Navigation to Raise Claim successful (dummy mode)',
      success: true
    });
  }

  const { internalUserId } = req.body;
  console.log(internalUserId, "raiseclaim")

  try {
    const result = await navigateToEPFOAndRaiseClaim(internalUserId);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to navigate to Raise Claim',
      error: error.message,
      success: false
    });
  }
};

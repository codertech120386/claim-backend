const uuid = require('uuid');

const { handleLogin, handleOTP } = require('./scraperUtils');

const BrowserSessionManager = require('./BrowserSessionManager');
const sessionManager = new BrowserSessionManager();

exports.startSession = async (req, res) => {
  if (process.env.MODE === 'dummy') {
    return res.status(200).json({
      message:
        'Login successful, OTP is sent to your Mobile Number : XXXXXX5610',
      otpRequired: true,
      internalUserId: '008941fb-7726-47bf-ab29-19ad1ede1727',
    });
  }

  const { mobile } = req.body;
  const internalUserId = uuid.v4();
  let isLoginSuccessful = false;

  try {
    const { loginResponse } = await loginUser(internalUserId, mobile);

    if (loginResponse.success) {
      isLoginSuccessful = true;
      res.status(200).json({
        otpRequired: true,
        internalUserId,
      });
    } else {
      res.status(loginResponse.status).json({
        message: loginResponse.message,
        internalUserId: internalUserId,
      });
    }
  } catch (error) {
    console.log('*********');
    console.log('error', error);
    console.log('*********');
    res.status(500).json({
      message: 'An error occurred during the login process.',
      error: error.message,
      internalUserId,
    });
  } finally {
    if (!isLoginSuccessful) {
      await sessionManager.closeSession(internalUserId);
      console.log('Session deleted due to unsuccessful login.');
    }
  }
};

const loginUser = async (internalUserId, mobile) => {
  console.log('Going to login user ');
  console.log('mobile : ' + mobile);

  const loginResponse = await handleLogin(internalUserId, mobile);

  return { loginResponse };
};

exports.submitOTP = async (req, res) => {
  if (process.env.MODE === 'dummy') {
    return res.status(200).send({
      message: 'OTP submitted successfully.',
      internalUserId: req.body.internalUserId,
    });
  }

  const { internalUserId, otp } = req.body;
  try {
    const mobile = '9833277189';
    const result = await handleOTP(mobile, internalUserId, otp);
    return res.status(result?.status).send({
      message: result?.message,
      internalUserId,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      internalUserId,
    });
  }
};

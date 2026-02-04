const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const genToken = require("../utils/token");
const sendOtpMail = require("../utils/mail");

const signUp = async function (req, res) {
  try {
    const { fullname, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }
    if (!mobile || mobile.toString().length !== 10) {
      return res.status(400).json({ message: "enter valid mobile number" });
    }

    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ fullname, email, password: hash, mobile, role });

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      message: "User registered successfully ☑️",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("error from auth.controllers.js");
    return res.status(500).json({ message: `sign up error ${err}` });
  }
};

const signIn = async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch == false) {
      return res.status(400).json({ message: "incorrect email or password" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "logged in successfully ☑️",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("error from auth.controllers.js");
    return res.status(500).json({ message: `signIn error ${err}` });
  }
};

const signOut = async function (req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "signOut successfully" });
  } catch (err) {
    return res.status(500).json({ message: `signOut error ${err}` });
  }
};

const sendOtp = async function (req, res) {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendOtpMail(email, otp);

    return res.status(201).json({ message: "OTP sent successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `error in auth.middleware.js sendOtp :- ${error}` });
  }
};

const verifyOtp = async function (req, res) {
  try {
    const { otp, email } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "invalid otp" });
    }
    user.resetOtp = undefined;
    user.isOtpVerified = true;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Otp verified" });
  } catch (error) {
    return res.status(500).json({ message: "error in opt verified" });
  }
};

const resetPassword = async function (req, res) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "otp verification is required " });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password Updated" });
  } catch (error) {
    return res.status(500).json({ message: "error in reseting the password" });
  }
};

const handleGoogleAuth = async function (req, res) {
  const { fullname, email, mobile, role } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    try {
      user = await User.create({
        fullname,
        email,
        mobile,
        role,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: `error in handleGoogleAuth ${error}` });
    }
  }
  const token = await genToken(user._id);
  res.cookie("token", token, {
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  console.log("logged in successfully ☑️");
  return res.status(201).json({
    message: "google authentication completed ☑️",
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
  });
};

module.exports = {
  signUp,
  signIn,
  signOut,
  sendOtp,
  verifyOtp,
  resetPassword,
  handleGoogleAuth,
};

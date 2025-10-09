const prisma = require("../../config/prismaConfig");
const { ConflictError, NotFoundError, ValidationError } = require("../../handler/CustomError");
const { generateOtp } = require("../../utils/generateOtp");
const generateOtpExpiry = require("../../utils/verifyOtp")
const { otpConstants, userConstants } = require("../../constants/constants");
const emailTemplates = require("../../utils/emailTemplate");
const sendEmails = require("../../utils/sendEmail");
const { comparePassword, hashPassword } = require("../../utils/passwordHashed");
const { genToken } = require("../../utils/generateToken");
const { handlerOk } = require("../../handler/resHandler");

const userRegister = async (req, res, next) => {
  try {
    const { email } = req.body;

    const finduser = await prisma.user.findFirst({
      where: {
        email
      }
    });

    if (finduser) {
      throw new ConflictError("User already exist")
    }

    const otp = generateOtp();
    const expiretime = generateOtpExpiry(2);

    await prisma.otp.create({
      data: {
        email,
        otp,
        otpReason: otpConstants.REGISTER,
        email,
        otpUsed: false,
        expiresAt: expiretime
      }
    })

    const emailData = {
      subject: "Dovetails - Account Verification",
      html: emailTemplates.register(otp),
    };

    await sendEmails(email, emailData.subject, emailData.html);


    handlerOk(res, 201, otp, "otp send successfully")


  } catch (error) {
    next(error)
  }
}

const userVerifyOtp = async (req, res, next) => {
  try {
    const { email, otp, password, deviceToken, deviceType } = req.body;

    const findotp = await prisma.otp.findFirst({
      where: {
        otp,
      }
    });

    if (!findotp) {
      throw new NotFoundError("otp not found")
    }

    const now = new Date();

    if (findotp.expiresAt < now) {
      throw new ConflictError("otp expired")
    }



    if (findotp.otpReason === "REGISTER") {

      const hashedPassword = await hashPassword(password, 10);

      if (findotp.otpUsed) {
        throw new ConflictError("OTP already used");
      }

      // Create the user without firstName and lastName
      const saveUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: userConstants.USER,
          deviceToken,
          deviceType
        }
      });

      if (!saveUser) {
        throw new ValidationError("User not saved");
      }

      // Mark OTP as used
      await prisma.otp.update({
        where: {
          id: findotp.id
        },
        data: {
          otpUsed: true,
        },
      });

      // Generate token
      const token = genToken({
        id: saveUser.id,
        userType: userConstants.USER,
      });

      handlerOk(res, 200, { ...saveUser, userToken: token }, "User registered successfully");
    }

    if (findotp.otpReason === "FORGETPASSWORD") {
      const finduser = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (!finduser) {
        throw new NotFoundError("user not found");
      }

      if (findotp.otpUsed) {
        throw new ConflictError("otp already used");
      }

      await prisma.otp.update({
        where: {
          id: findotp.id
        },
        data: {
          otpUsed: true,
        }
      });


      // ✅ Generate token
      const token = genToken({
        id: finduser.id,
        userType: userConstants.USER,
      });

      return handlerOk(res, 201, { userToken: token }, "Now set your password");
    }


  } catch (error) {
    next(error)
  }
}

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const finduser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!finduser) {
      throw new NotFoundError("user not found");
    }

    const comparePass = await comparePassword(password, finduser.password);

    if (!comparePass) {
      throw new BadRequestError("invalid password");
    }

    const token = genToken({
      id: finduser.id,
      userType: userConstants.USER,
    });

    const response = {
      userToken: token,
    }


    handlerOk(res, 200, { ...finduser, ...response }, "user login successfully")

  } catch (error) {
    next(error)
  }
}


const userForgetPassword = async (req, res, next) => {
  try {

    const { email } = req.body;

    const finduser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!finduser) {
      throw new NotFoundError("user not found");
    }

    const otp = generateOtp();
    const expiretime = generateOtpExpiry(2);

    const createotp = await prisma.otp.create({
      data: {
        email,
        // userId: finduser.id,
        otp,
        otpReason: otpConstants.FORGETPASSWORD,
        otpUsed: false,
        expiresAt: expiretime
      }
    })

    const emailData = {
      subject: "Dovetails - Reset Your Password",
      html: emailTemplates.forgetPassword(otp),
    };

    await sendEmails(email, emailData.subject, emailData.html);


    handlerOk(res, 200, otp, "otp send successfully");

  } catch (error) {
    next(error)
  }
}

const userResetPassword = async (req, res, next) => {
  try {

    const { password } = req.body;
    const { id } = req.user;

    console.log(id, 'id');

    const hashPass = await hashPassword(password);

    const updatePass = await prisma.user.update({
      where: {
        id: id
      },
      data: {
        password: hashPass
      }
    });

    if (!updatePass) {
      throw new ValidationError("password not update");
    }

    handlerOk(res, 200, updatePass, "password updated successfully");

  } catch (error) {
    next(error)
  }
}

const userEditProfile = async (req, res, next) => {
  try {

    const { id } = req.user;
    const { firstName, lastName, phoneNumber } = req.body;

    console.log(req.body);

    const file = req.file;

    console.log(file, 'file');

    const updateObj = {};

    if (file) {
      const filePath = file.filename; // use filename instead of path
      const basePath = `http://${req.get("host")}/public/uploads/`;
      const image = `${basePath}${filePath}`;
      updateObj.userImage = image;
    }

    if (firstName) {
      updateObj.firstName = firstName;
    }

    if (lastName) {
      updateObj.lastName = lastName;
    }

    if (phoneNumber) {
      updateObj.phoneNumber = phoneNumber;
    }


    const updateProfile = await prisma.user.update({
      where: {
        id: id
      },
      data: updateObj
    });

    if (!updateProfile) {
      throw new ValidationError("user profile not update")
    }

    handlerOk(res, 200, updateProfile, "user profile updated successfully");


  } catch (error) {
    next(error)
  }
}


const userLogout = async (req, res, next) => {
  try {

    const { id } = req.user;

    const logOutUser = await prisma.user.update({
      where: {
        id: id
      },
      data: {
        deviceToken: null
      }
    });

    if (!logOutUser) {
      throw new ValidationError("user not logout")
    }

    handlerOk(res, 200, null, "user logout successfully");

  } catch (error) {
    next(error)
  }
}


const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;

    const finduser = await prisma.user.findUnique({
      where: {
        id
      }
    });

    if (!finduser) {
      throw new NotFoundError("User not found")
    }

    handlerOk(res, 200, finduser, "User found successfully");

  } catch (error) {
    next(error)
  }
}


module.exports = {
  userRegister,
  userLogin,
  userForgetPassword,
  userResetPassword,
  userVerifyOtp,
  userEditProfile,
  userLogout,
  getMe
}
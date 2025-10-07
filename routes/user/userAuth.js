const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const userAuthRouter = require("express").Router();
const userAuthController = require("../../controllers/user/userAuthController");
const { verifyUserToken } = require("../../middleware/auth");
const handleMultiPartData = require("../../middleware/handleMultiPartData");
const { userRegisterSchema, userLoginSchema, userverifyOtpSchema, userForgetPasswordSchema, userResetPasswordSchema, userEditProfileSchema } = require("../../schema/user/auth");



userAuthRouter.post(
  "/userRegister",
  limiter,
  validateRequest(userRegisterSchema),
  userAuthController.userRegister
);

userAuthRouter.post(
  "/userLogin",
  limiter,
  validateRequest(userLoginSchema),
  userAuthController.userLogin
);

userAuthRouter.post(
  "/userVerifyOtp",
  limiter,
  validateRequest(userverifyOtpSchema),
  userAuthController.userVerifyOtp
);

userAuthRouter.post(
  "/userForgetPassword",
  limiter,
  validateRequest(userForgetPasswordSchema),
  userAuthController.userForgetPassword
);

userAuthRouter.post(
  "/userResetPassword",
  limiter,
  verifyUserToken,
  validateRequest(userResetPasswordSchema),
  userAuthController.userResetPassword
);

userAuthRouter.put(
  "/userEditProfile",
  limiter,
  verifyUserToken,
  validateRequest(userEditProfileSchema),
  handleMultiPartData.single("userImage"),
  userAuthController.userEditProfile
);


userAuthRouter.get(
  "/getMe",
  limiter,
  verifyUserToken,
  userAuthController.getMe
);

userAuthRouter.post(
  "/userLogout",
  limiter,
  verifyUserToken,
  userAuthController.userLogout
);

module.exports = userAuthRouter;
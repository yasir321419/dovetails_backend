const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");


const adminAuthRouter = require("express").Router();
// const userAuthController = require("../../controllers/user/userAuthController");
// const { verifyUserToken } = require("../../middleware/auth");
// const handleMultiPartData = require("../../middleware/handleMultiPartData");



adminAuthRouter.post(
  "/signUp",
  // limiter,
  // validateRequest(userRegisterSchema),
  // userAuthController.signUp
);

module.exports = adminAuthRouter;
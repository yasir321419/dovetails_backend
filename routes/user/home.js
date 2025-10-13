const userHomeRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const { optionalUserAuth, verifyUserToken } = require("../../middleware/auth");
const homeController = require("../../controllers/user/homeController");

userHomeRouter.get(
  "/getHomeFeed",
  limiter,
  verifyUserToken,
  homeController.getHomeFeed
);

module.exports = userHomeRouter;

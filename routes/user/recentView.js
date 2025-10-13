const userRecentViewRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const { verifyUserToken } = require("../../middleware/auth");
const recentViewController = require("../../controllers/user/recentViewController");

userRecentViewRouter.get(
  "/showRecentViews",
  limiter,
  verifyUserToken,
  recentViewController.showRecentViews
);

module.exports = userRecentViewRouter;

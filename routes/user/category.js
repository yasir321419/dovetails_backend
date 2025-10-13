const userCategoryRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const { optionalUserAuth, verifyUserToken } = require("../../middleware/auth");
const categoryController = require("../../controllers/user/categoryController");

userCategoryRouter.get(
  "/getCategories",
  limiter,
  verifyUserToken,
  categoryController.getCategories
);

module.exports = userCategoryRouter;

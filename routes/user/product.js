const userProductRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { verifyUserToken, optionalUserAuth } = require("../../middleware/auth");
const productController = require("../../controllers/user/productController");
const {
  userListProductsSchema,
  userGetProductSchema,
  userRecordViewSchema,
} = require("../../schema/user/product");

userProductRouter.get(
  "/showProducts",
  limiter,
  validateRequest(userListProductsSchema),
  verifyUserToken,
  productController.showProducts
);

userProductRouter.get(
  "/featured",
  limiter,
  verifyUserToken,
  productController.getFeaturedProducts
);

userProductRouter.get(
  "/showSingleProduct/:productId",
  limiter,
  validateRequest(userGetProductSchema),
  verifyUserToken,
  productController.showSingleProduct
);

userProductRouter.get(
  "/recordProductView/:productId",
  limiter,
  verifyUserToken,
  validateRequest(userRecordViewSchema),
  productController.recordProductView
);

module.exports = userProductRouter;

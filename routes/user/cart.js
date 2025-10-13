const userCartRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { verifyUserToken } = require("../../middleware/auth");
const cartController = require("../../controllers/user/cartController");
const {
  userAddCartItemSchema,
  userUpdateCartItemSchema,
  userRemoveCartItemSchema,
  userGetCartSchema,
} = require("../../schema/user/cart");

userCartRouter.get(
  "/getCart",
  limiter,
  verifyUserToken,
  cartController.getCart
);

userCartRouter.post(
  "/addCartItem",
  limiter,
  verifyUserToken,
  validateRequest(userAddCartItemSchema),
  cartController.addCartItem
);

userCartRouter.put(
  "/updateCartItem/:cartItemId",
  limiter,
  verifyUserToken,
  validateRequest(userUpdateCartItemSchema),
  cartController.updateCartItem
);

userCartRouter.delete(
  "/removeCartItem/:cartItemId",
  limiter,
  verifyUserToken,
  validateRequest(userRemoveCartItemSchema),
  cartController.removeCartItem
);

userCartRouter.delete(
  "/clearCart",
  limiter,
  verifyUserToken,
  cartController.clearCart
);

module.exports = userCartRouter;

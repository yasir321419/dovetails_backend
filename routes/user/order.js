const userOrderRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { verifyUserToken } = require("../../middleware/auth");
const orderController = require("../../controllers/user/orderController");
const {
  userCreateOrderSchema,
  userGetOrderSchema,
  userListOrdersSchema,
} = require("../../schema/user/order");

userOrderRouter.post(
  "/createOrder",
  limiter,
  verifyUserToken,
  validateRequest(userCreateOrderSchema),
  orderController.createOrder
);

userOrderRouter.get(
  "/showOrders",
  limiter,
  verifyUserToken,
  validateRequest(userListOrdersSchema),
  orderController.showOrders
);

userOrderRouter.get(
  "/showSingleOrder/:orderId",
  limiter,
  verifyUserToken,
  validateRequest(userGetOrderSchema),
  orderController.showSingleOrder
);

module.exports = userOrderRouter;

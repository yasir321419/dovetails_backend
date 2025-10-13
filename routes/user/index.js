const userRouter = require("express").Router();

const userAuthRouter = require("./userAuth");
const userCategoryRouter = require("./category");
const userProductRouter = require("./product");
const userFavoriteRouter = require("./favorite");
const userCartRouter = require("./cart");
const userOrderRouter = require("./order");
const userHomeRouter = require("./home");
const userRecentViewRouter = require("./recentView");

userRouter.use("/auth", userAuthRouter);
userRouter.use("/categories", userCategoryRouter);
userRouter.use("/products", userProductRouter);
userRouter.use("/favorites", userFavoriteRouter);
userRouter.use("/cart", userCartRouter);
userRouter.use("/orders", userOrderRouter);
userRouter.use("/home", userHomeRouter);
userRouter.use("/recent-views", userRecentViewRouter);

module.exports = userRouter;

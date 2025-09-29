const userRouter = require("express").Router();
const userAuthRouter = require("./userAuth");


userRouter.use("/auth", userAuthRouter);









module.exports = userRouter;
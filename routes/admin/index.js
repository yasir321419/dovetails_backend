const adminRouter = require("express").Router();
const adminAuthRouter = require("./adminAuth");
const adminCategoryRouter = require("./adminCategory");
const adminProductRouter = require("./adminProduct");

adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/category", adminCategoryRouter);
adminRouter.use("/products", adminProductRouter);

module.exports = adminRouter;

const adminRouter = require("express").Router();
const adminAuthRouter = require("./adminAuth");
const adminCategoryRouter = require("./adminCategory");



adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/category", adminCategoryRouter);










module.exports = adminRouter;
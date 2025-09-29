const adminRouter = require("express").Router();
const adminAuthRouter = require("./adminAuth");


adminRouter.use("/auth", adminAuthRouter);









module.exports = adminRouter;
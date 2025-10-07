const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { adminLoginSchema } = require("../../schema/admin/auth");
const adminAuthRouter = require("express").Router();
const adminAuthController = require("../../controllers/admin/adminAuthController");

adminAuthRouter.post(
  "/adminLogin",
  limiter,
  validateRequest(adminLoginSchema),
  adminAuthController.adminLogin
);

module.exports = adminAuthRouter;

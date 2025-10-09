const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const adminCategoryRouter = require("express").Router();
const adminCategoryController = require("../../controllers/admin/adminCategoryController");
const { verifyAdminToken, verifyMultiRoleToken } = require("../../middleware/auth");
const { adminCreateCategorySchema, adminUpdateCategorySchema, adminDeleteCategorySchema } = require("../../schema/admin/category");

adminCategoryRouter.post(
  "/createCategory",
  limiter,
  verifyAdminToken,
  validateRequest(adminCreateCategorySchema),
  adminCategoryController.createCategory
);

adminCategoryRouter.get(
  "/showCategory",
  limiter,
  verifyMultiRoleToken,
  adminCategoryController.showCategory
);

adminCategoryRouter.put(
  "/updateCategory/:categoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminUpdateCategorySchema),
  adminCategoryController.updateCategory
);

adminCategoryRouter.delete(
  "/deleteCategory/:categoryId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteCategorySchema),
  adminCategoryController.deleteCategory
);

module.exports = adminCategoryRouter;

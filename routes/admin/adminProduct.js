const adminProductRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { verifyAdminToken } = require("../../middleware/auth");
const adminProductController = require("../../controllers/admin/adminProductController");
const {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  adminDeleteProductSchema,
  adminGetProductSchema,
  adminListProductSchema,
} = require("../../schema/admin/product");
const handleMultiPartData = require("../../middleware/handleMultiPartData");

adminProductRouter.post(
  "/createProduct",
  limiter,
  verifyAdminToken,
  handleMultiPartData.single("image"),
  validateRequest(adminCreateProductSchema),
  adminProductController.createProduct
);

adminProductRouter.get(
  "/ShowProducts",
  limiter,
  verifyAdminToken,
  validateRequest(adminListProductSchema),
  adminProductController.ShowProducts
);

adminProductRouter.get(
  "/showSingleProduct/:productId",
  limiter,
  verifyAdminToken,
  validateRequest(adminGetProductSchema),
  adminProductController.showSingleProduct
);

adminProductRouter.put(
  "/updateProduct/:productId",
  limiter,
  verifyAdminToken,
  handleMultiPartData.single("image"),

  validateRequest(adminUpdateProductSchema),
  adminProductController.updateProduct
);

adminProductRouter.delete(
  "/deleteProduct/:productId",
  limiter,
  verifyAdminToken,
  validateRequest(adminDeleteProductSchema),
  adminProductController.deleteProduct
);

module.exports = adminProductRouter;

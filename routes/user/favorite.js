const userFavoriteRouter = require("express").Router();

const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { verifyUserToken } = require("../../middleware/auth");
const favoriteController = require("../../controllers/user/favoriteController");
const {
  userAddFavoriteSchema,
  userRemoveFavoriteSchema,
  userListFavoriteSchema,
} = require("../../schema/user/favorite");

userFavoriteRouter.post(
  "/addFavorite",
  limiter,
  verifyUserToken,
  validateRequest(userAddFavoriteSchema),
  favoriteController.addFavorite
);

userFavoriteRouter.get(
  "/showFavorites",
  limiter,
  verifyUserToken,
  validateRequest(userListFavoriteSchema),
  favoriteController.showFavorites
);

userFavoriteRouter.delete(
  "/removeFavorite/:productId",
  limiter,
  verifyUserToken,
  validateRequest(userRemoveFavoriteSchema),
  favoriteController.removeFavorite
);

module.exports = userFavoriteRouter;

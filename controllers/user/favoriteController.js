const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");
const { NotFoundError } = require("../../handler/CustomError");

const addFavorite = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { productId } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
    });

    handlerOk(res, 200, favorite, "Product added to favorites");
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { productId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError("Favorite not found");
    }

    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    handlerOk(res, 200, null, "Product removed from favorites");
  } catch (error) {
    next(error);
  }
};

const showFavorites = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: [
                { isPrimary: "desc" },
                { createdAt: "asc" },
              ],
            },
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    handlerOk(res, 200, favorites, "Favorites fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  showFavorites,
};

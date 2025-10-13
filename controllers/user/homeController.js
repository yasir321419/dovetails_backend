const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");

const getHomeFeed = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const [categories, featuredProducts] = await Promise.all([
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
      prisma.product.findMany({
        where: {
          isFeatured: true,
        },
        include: {
          images: {
            orderBy: [
              { isPrimary: "desc" },
              { createdAt: "asc" },
            ],
          },
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      }),
    ]);

    let recentViews = [];
    let favorites = [];

    if (userId) {
      [recentViews, favorites] = await Promise.all([
        prisma.recentView.findMany({
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
            viewedAt: "desc",
          },
          take: 10,
        }),
        prisma.favorite.findMany({
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
          take: 10,
        }),
      ]);
    }

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category._count.products,
    }));

    handlerOk(
      res,
      200,
      {
        categories: formattedCategories,
        featuredProducts,
        recentViews,
        favorites,
      },
      "Home content fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomeFeed,
};

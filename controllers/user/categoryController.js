const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formatted = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category._count.products,
      createdAt: category.createdAt,
    }));

    handlerOk(res, 200, formatted, "Categories fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
};

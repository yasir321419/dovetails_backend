const { Prisma } = require("@prisma/client");
const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");
const { NotFoundError } = require("../../handler/CustomError");

const productIncludes = {
  images: {
    orderBy: [
      { isPrimary: "desc" },
      { createdAt: "asc" },
    ],
  },
  category: true,
};

const resolveOrderBy = (sortBy = "createdAt", sortOrder = "desc") => {
  const direction = sortOrder === "asc" ? "asc" : "desc";

  if (sortBy === "price") {
    return { price: direction };
  }

  if (sortBy === "rating") {
    return { averageRating: direction };
  }

  return { createdAt: direction };
};

const showProducts = async (req, res, next) => {
  try {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy,
      sortOrder,
      page = 1,
      limit = 20,
    } = req.query;

    const whereClause = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (typeof isFeatured !== "undefined") {
      whereClause.isFeatured = isFeatured === "true";
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        whereClause.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice) {
        whereClause.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    const take = Number(limit) || 20;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * take;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        include: productIncludes,
        orderBy: resolveOrderBy(sortBy, sortOrder),
        skip,
        take,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    handlerOk(res, 200, {
      items: products,
      pagination: {
        total,
        page: pageNumber,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    }, "Products fetched successfully");
  } catch (error) {
    next(error);
  }
};

const showSingleProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productIncludes,
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (userId) {
      await prisma.recentView.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          userId,
          productId,
        },
      });
    }

    handlerOk(res, 200, product, "Product fetched successfully");
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      include: productIncludes,
      orderBy: { createdAt: "desc" },
      take: Number(limit) || 8,
    });

    handlerOk(res, 200, products, "Featured products fetched successfully");
  } catch (error) {
    next(error);
  }
};

const recordProductView = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { id: userId } = req.user;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const recentView = await prisma.recentView.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        productId,
      },
    });

    handlerOk(res, 200, recentView, "Product view recorded successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  showProducts,
  showSingleProduct,
  getFeaturedProducts,
  recordProductView,
};

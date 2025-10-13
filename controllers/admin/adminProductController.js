const { Prisma } = require("@prisma/client");
const prisma = require("../../config/prismaConfig");
const {
  ConflictError,
  NotFoundError,
  ValidationError,
} = require("../../handler/CustomError");
const { handlerOk } = require("../../handler/resHandler");

const productIncludes = {
  images: {
    orderBy: [
      { isPrimary: "desc" },
      { createdAt: "asc" },
    ],
  },
  category: true,
};

const formatImagesForCreate = (images = []) =>
  images.map((image, index) => ({
    url: image.url,
    isPrimary: typeof image.isPrimary === "boolean" ? image.isPrimary : index === 0,
  }));

const parseNumber = (value, fallback = null) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const parseBoolean = (value, fallback = null) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const createProduct = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const { name, description, price, currency, stock, isFeatured, categoryId } = req.body;
    let { images } = req.body;

    const uploadedFile = req.file;
    const collectedImages = [];

    if (typeof images === "string") {
      try {
        images = JSON.parse(images);
      } catch {
        collectedImages.push({ url: images });
        images = undefined;
      }
    }

    if (Array.isArray(images)) {
      collectedImages.push(
        ...images.map((image) =>
          typeof image === "string" ? { url: image } : image
        )
      );
    }

    if (uploadedFile) {
      const filePath = uploadedFile.filename;
      const basePath = `http://${req.get("host")}/public/uploads/`;
      const imageUrl = `${basePath}${filePath}`;
      collectedImages.unshift({
        url: imageUrl,
        isPrimary: true,
      });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        name,
      },
    });

    if (existingProduct) {
      throw new ConflictError("Product with this name already exists");
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    const imagesPayload = collectedImages.length
      ? {
        create: formatImagesForCreate(collectedImages),
      }
      : undefined;

    let parsedStock = 0;
    if (!(typeof stock === "undefined" || stock === null || (typeof stock === "string" && stock.trim() === ""))) {
      parsedStock = parseNumber(stock, null);
      if (parsedStock === null) {
        throw new ValidationError("Invalid stock value");
      }
    }

    let parsedIsFeatured = false;
    if (!(typeof isFeatured === "undefined" || isFeatured === null || (typeof isFeatured === "string" && isFeatured.trim() === ""))) {
      const boolValue = parseBoolean(isFeatured, null);
      if (boolValue === null) {
        throw new ValidationError("Invalid isFeatured value");
      }
      parsedIsFeatured = boolValue;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: new Prisma.Decimal(price),
        currency: currency?.toUpperCase() ?? "PKR",
        stock: parsedStock,
        isFeatured: parsedIsFeatured,
        categoryId: categoryId || null,
        adminId,
        images: imagesPayload,
      },
      include: productIncludes,
    });

    handlerOk(res, 201, product, "Product created successfully");
  } catch (error) {
    next(error);
  }
};

const ShowProducts = async (req, res, next) => {
  try {
    const { search, isFeatured } = req.query;

    const whereClause = {};

    if (typeof isFeatured !== "undefined") {
      whereClause.isFeatured = isFeatured === "true";
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: productIncludes,
      orderBy: { createdAt: "desc" },
    });

    handlerOk(res, 200, products, "Products fetched successfully");
  } catch (error) {
    next(error);
  }
};

const showSingleProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productIncludes,
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    handlerOk(res, 200, product, "Product fetched successfully");
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price, currency, stock, isFeatured, categoryId, images } = req.body;

    console.log(req.body)

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product not found");
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    const updatePayload = {};

    if (name) updatePayload.name = name;
    if (typeof description !== "undefined") updatePayload.description = description;
    if (typeof price !== "undefined") updatePayload.price = new Prisma.Decimal(price);
    if (currency) updatePayload.currency = currency.toUpperCase();
    if (typeof stock !== "undefined") {
      if (stock === null || (typeof stock === "string" && stock.trim() === "")) {
        updatePayload.stock = 0;
      } else {
        const parsedStock = parseNumber(stock, null);
        if (parsedStock === null) {
          throw new ValidationError("Invalid stock value");
        }
        updatePayload.stock = parsedStock;
      }
    }
    if (typeof isFeatured !== "undefined") {
      if (isFeatured === null || (typeof isFeatured === "string" && isFeatured.trim() === "")) {
        updatePayload.isFeatured = existingProduct.isFeatured ?? false;
      } else {
        const boolValue = parseBoolean(isFeatured, null);
        if (boolValue === null) {
          throw new ValidationError("Invalid isFeatured value");
        }
        updatePayload.isFeatured = boolValue;
      }
    }
    if (typeof categoryId !== "undefined") updatePayload.categoryId = categoryId || null;

    if (Object.keys(updatePayload).length === 0 && !Array.isArray(images)) {
      throw new ValidationError("Nothing to update");
    }

    await prisma.product.update({
      where: { id: productId },
      data: updatePayload,
    });

    if (Array.isArray(images)) {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId } }),
        prisma.productImage.createMany({
          data: formatImagesForCreate(images).map((image) => ({
            ...image,
            productId,
          })),
        }),
      ]);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productIncludes,
    });

    handlerOk(res, 200, product, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product not found");
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    handlerOk(res, 200, null, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  ShowProducts,
  showSingleProduct,
  updateProduct,
  deleteProduct,
};

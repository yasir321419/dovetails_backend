const { Prisma } = require("@prisma/client");
const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");
const { NotFoundError, ValidationError } = require("../../handler/CustomError");

const cartItemInclude = {
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
};

const fetchCartWithItems = (cartId) =>
  prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: cartItemInclude,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

const ensureCart = async (userId) => {
  const existingCart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
    },
  });
};

const getCart = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const cart = await ensureCart(userId);
    const detailedCart = await fetchCartWithItems(cart.id);

    handlerOk(res, 200, detailedCart, "Cart fetched successfully");
  } catch (error) {
    next(error);
  }
};

const addCartItem = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stock < quantity) {
      throw new ValidationError("Requested quantity exceeds available stock");
    }

    const cart = await ensureCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price,
        },
      });
    }

    const detailedCart = await fetchCartWithItems(cart.id);

    handlerOk(res, 200, detailedCart, "Item added to cart successfully");
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundError("Cart item not found");
    }

    if (quantity < 1) {
      throw new ValidationError("Quantity must be at least 1");
    }

    const product = await prisma.product.findUnique({
      where: { id: cartItem.productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stock < quantity) {
      throw new ValidationError("Requested quantity exceeds available stock");
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        unitPrice: new Prisma.Decimal(product.price),
      },
    });

    const detailedCart = await fetchCartWithItems(cart.id);

    handlerOk(res, 200, detailedCart, "Cart updated successfully");
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { cartItemId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundError("Cart item not found");
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    const detailedCart = await fetchCartWithItems(cart.id);

    handlerOk(res, 200, detailedCart, "Item removed from cart successfully");
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    handlerOk(res, 200, null, "Cart cleared successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};

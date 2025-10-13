const { Prisma } = require("@prisma/client");
const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");
const { NotFoundError, ValidationError } = require("../../handler/CustomError");

const orderItemInclude = {
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

const createOrder = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { shippingAddress, shippingFee = 0, paymentStatus } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: true,
      },
    });

    const subtotalDecimal = cartItems.reduce(
      (sum, item) => sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0)
    );

    const shippingFeeDecimal = new Prisma.Decimal(shippingFee);
    const totalAmount = subtotalDecimal.plus(shippingFeeDecimal);

    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress: shippingAddress || null,
        shippingFee: shippingFeeDecimal,
        totalAmount: totalAmount,
        paymentStatus: paymentStatus || "PENDING",
        items: {
          create: cartItems.map((item) => {
            const unitPrice = new Prisma.Decimal(item.unitPrice);
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice,
              subtotal: unitPrice.mul(item.quantity),
            };
          }),
        },
      },
      include: {
        items: {
          include: orderItemInclude,
        },
      },
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    handlerOk(res, 201, order, "Order created successfully");
  } catch (error) {
    next(error);
  }
};

const showOrders = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: {
        placedAt: "desc",
      },
      include: {
        items: {
          include: orderItemInclude,
        },
      },
    });

    handlerOk(res, 200, orders, "Orders fetched successfully");
  } catch (error) {
    next(error);
  }
};

const showSingleOrder = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: orderItemInclude,
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    handlerOk(res, 200, order, "Order fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  showOrders,
  showSingleOrder,
};

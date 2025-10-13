const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../handler/resHandler");

const showRecentViews = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const recentViews = await prisma.recentView.findMany({
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
      take: 20,
    });

    handlerOk(res, 200, recentViews, "Recent views fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  showRecentViews,
};

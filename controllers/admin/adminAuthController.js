const prisma = require("../../config/prismaConfig");
const { BadRequestError } = require("../../handler/CustomError");
const { handlerOk } = require("../../handler/resHandler");
const { comparePassword } = require("../../utils/passwordHashed");
const { genToken } = require("../../utils/generateToken");
const { userConstants } = require("../../constants/constants");

const adminLogin = async (req, res, next) => {
  try {
    const { email, password, deviceToken } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.password) {
      throw new BadRequestError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      throw new BadRequestError("Invalid email or password");
    }

    let adminRecord = admin;

    if (deviceToken && deviceToken !== admin.deviceToken) {
      adminRecord = await prisma.admin.update({
        where: { id: admin.id },
        data: { deviceToken },
      });
    }

    const token = genToken({
      id: admin.id,
      userType: userConstants.ADMIN,
    });

    const { password: _password, ...adminWithoutPassword } = adminRecord;

    handlerOk(
      res,
      200,
      { ...adminWithoutPassword, adminToken: token },
      "Admin login successful"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
};

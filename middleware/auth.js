const jwt = require("jsonwebtoken");
const { BadRequestError, UnAuthorizedError, NotFoundError } = require("../handler/CustomError");
const prisma = require("../config/prismaConfig");
const { userConstants } = require("../constants/constants");
require("dotenv").config();

const getTokenFromHeaders = (req) =>
  req.headers["x-access-token"] || req.headers["authorization"]?.split(" ")[1];

const verifyUserToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);
    if (!token) {
      throw new BadRequestError("A token is required for authentication");
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode, "decode");

    const userId = decode.id;
    const userType = decode.userType;

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
        userType: userType,
      },
    });
    if (!findUser) {
      throw new NotFoundError("User Not Found");
    }

    req.user = findUser;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnAuthorizedError("Token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new UnAuthorizedError("Token is Invalid"));
    }
    return next(error);
  }
};


const verifyAdminToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);
    if (!token) {
      throw new BadRequestError("A token is required for authentication");
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode, "decode");

    const adminId = decode.id;
    const userType = decode.userType;

    const findAdmin = await prisma.admin.findFirst({
      where: {
        id: adminId,
        userType: userType,
      },
    });

    if (!findAdmin) {
      throw new NotFoundError("Admin Not Found");
    }

    req.user = findAdmin;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnAuthorizedError("Token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new UnAuthorizedError("Token is Invalid"));
    }
    return next(error);
  }
};

const optionalAdminAuth = async (req, res, next) => {
  const token = getTokenFromHeaders(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log(decoded, "decode");

      const adminId = decoded.id;
      const userType = decoded.userType;

      const findAdmin = await prisma.admin.findFirst({
        where: {
          id: adminId,
          userType: userType,
        },
      });

      if (findAdmin) {
        req.user = findAdmin;
      }
    } catch (error) {
      // You can choose to log it or ignore silently
      if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        // Optional: You could log it for debug
        console.log("Optional token invalid/expired:", error.message);
      }
      // Do not block the request; continue to next middleware
    }
  }

  next();
};


const verifyMultiRoleToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);
    if (!token) {
      throw new BadRequestError("A token is required for authentication");
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded, "decode");

    const { id, userType } = decoded;

    if (userType === userConstants.USER) {
      const user = await prisma.user.findFirst({
        where: { id, userType },
      });
      if (!user) {
        throw new NotFoundError("User Not Found");
      }
      req.user = user;
      return next();
    }

    if (userType === userConstants.ADMIN) {
      const admin = await prisma.admin.findFirst({
        where: { id, userType },
      });
      if (!admin) {
        throw new NotFoundError("Admin Not Found");
      }
      req.user = admin;
      return next();
    }

    throw new UnAuthorizedError("Token role not supported");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnAuthorizedError("Token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new UnAuthorizedError("Token is Invalid"));
    }
    next(error);
  }
};

const optionalUserAuth = async (req, res, next) => {
  const token = getTokenFromHeaders(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log(decoded, "decode");

      const user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          userType: decoded.userType,
        },
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
      if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        console.log("Optional token invalid/expired:", error.message);
      }
    }
  }

  next();
};

module.exports = {
  verifyUserToken,
  verifyAdminToken,
  optionalAdminAuth,
  optionalUserAuth,
  verifyMultiRoleToken,
};

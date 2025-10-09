const { deviceType } = require("@prisma/client");
const Joi = require("joi");

const userRegisterSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().required()
  }),
});

const userResendOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().required()
  }),
});

const userverifyOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
    deviceType: Joi.string().valid("ANDROID", "IOS").optional(),
    deviceToken: Joi.string().optional(),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$'))
      .optional()
      .messages({
        'string.pattern.base': 'Password must include uppercase, lowercase, and a number.',
      }),
    confirmPassword: Joi.any()
      .valid(Joi.ref('password'))
      .optional()
      .messages({ 'any.only': 'Confirm password must match password' }),
    otp: Joi.string().required()
  }),
});

const userLoginSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
});

const userForgetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().required()
  }),
});

const userResetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    password: Joi.string().required()
  }),
});

const userEditProfileSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    gender: Joi.string().optional(),
  }),
});


const userChangePasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    currentpassword: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$'))
      .required()
      .messages({
        'string.pattern.base': 'Password must include uppercase, lowercase, and a number.',
      }),
    newpassword: Joi.string()
      .min(8)
      .max(30)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$'))
      .required()
      .messages({
        'string.pattern.base': 'Password must include uppercase, lowercase, and a number.',
      }),
    confirmPassword: Joi.any()
      .valid(Joi.ref('newpassword'))
      .optional()
      .messages({ 'any.only': 'Confirm password must match password' }),
  }),
});






module.exports = {
  userRegisterSchema,
  userverifyOtpSchema,
  userLoginSchema,
  userForgetPasswordSchema,
  userResetPasswordSchema,
  userEditProfileSchema,
  userChangePasswordSchema,
  userResendOtpSchema
}
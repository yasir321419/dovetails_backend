const Joi = require("joi");

const userCreateOrderSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    shippingAddress: Joi.string().trim().optional(),
    shippingFee: Joi.number().precision(2).min(0).optional(),
    paymentStatus: Joi.string().valid("PENDING", "PAID", "REFUNDED").optional(),
  }),
});

const userGetOrderSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    orderId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});

const userListOrdersSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  userCreateOrderSchema,
  userGetOrderSchema,
  userListOrdersSchema,
};

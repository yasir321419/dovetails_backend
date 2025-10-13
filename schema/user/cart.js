const Joi = require("joi");

const userAddCartItemSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).default(1),
  }),
});

const userUpdateCartItemSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    cartItemId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }),
});

const userRemoveCartItemSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    cartItemId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});


module.exports = {
  userAddCartItemSchema,
  userUpdateCartItemSchema,
  userRemoveCartItemSchema,
};

const Joi = require("joi");

const userAddFavoriteSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
});

const userRemoveFavoriteSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});

const userListFavoriteSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  userAddFavoriteSchema,
  userRemoveFavoriteSchema,
  userListFavoriteSchema,
};

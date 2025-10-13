const Joi = require("joi");

const userListProductsSchema = Joi.object({
  query: Joi.object({
    categoryId: Joi.string().uuid().optional(),
    search: Joi.string().optional(),
    minPrice: Joi.number().precision(2).min(0).optional(),
    maxPrice: Joi.number().precision(2).min(0).optional(),
    isFeatured: Joi.boolean().optional(),
    sortBy: Joi.string().valid("createdAt", "price", "rating").optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
  params: Joi.object({}),
  body: Joi.object({}),
});

const userGetProductSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});

const userRecordViewSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  userListProductsSchema,
  userGetProductSchema,
  userRecordViewSchema,
};

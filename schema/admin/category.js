const Joi = require("joi");

const adminCreateCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    name: Joi.string().required()
  }),
});

const adminUpdateCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    categoryId: Joi.string().required()
  }),
  body: Joi.object({
    name: Joi.string().required()
  }),
});

const adminDeleteCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    categoryId: Joi.string().required()

  }),
  body: Joi.object({
  }),
});

module.exports = {
  adminCreateCategorySchema,
  adminUpdateCategorySchema,
  adminDeleteCategorySchema
}
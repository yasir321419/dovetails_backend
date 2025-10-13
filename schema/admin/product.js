const Joi = require("joi");

const numericString = (regex = /^\d+(\.\d+)?$/) =>
  Joi.string()
    .pattern(regex)
    .messages({
      "string.pattern.base": "Value must be a valid number",
    });

const booleanString = Joi.string().valid("true", "false", "1", "0");

const baseProductBody = {
  name: Joi.string().trim().min(2),
  description: Joi.string().allow("", null),
  price: Joi.alternatives().try(
    Joi.number().precision(2).positive(),
    numericString()
  ),
  currency: Joi.string().trim().length(3).uppercase(),
  stock: Joi.alternatives().try(
    Joi.number().integer().min(0),
    numericString(/^\d+$/)
  ),
  isFeatured: Joi.alternatives().try(Joi.boolean(), booleanString),
  categoryId: Joi.string().uuid().allow(null, ""),
  images: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.object({
          url: Joi.string().uri().required(),
          isPrimary: Joi.boolean().optional(),
        })
      ),
      Joi.string()
    )
    .optional(),
};

const adminCreateProductSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    ...baseProductBody,
    name: baseProductBody.name.required(),
    price: baseProductBody.price.required(),
  }),
});

const adminUpdateProductSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  body: Joi.object(baseProductBody).min(1),
});

const adminDeleteProductSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});

const adminGetProductSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
});

const adminListProductSchema = Joi.object({
  query: Joi.object({
    categoryId: Joi.string().uuid().optional(),
    search: Joi.string().optional(),
    isFeatured: Joi.alternatives().try(Joi.boolean(), booleanString).optional(),
  }),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  adminCreateProductSchema,
  adminUpdateProductSchema,
  adminDeleteProductSchema,
  adminGetProductSchema,
  adminListProductSchema,
};

import Joi from 'joi';

export const createPostSchema = Joi.object({
  images: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'At least one image is required',
      'array.max': 'Maximum 10 images allowed',
      'any.required': 'Images are required',
    }),

  caption: Joi.string().max(2200).optional().allow('').messages({
    'string.max': 'Caption must not exceed 2200 characters',
  }),

  location: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Location must not exceed 100 characters',
  }),
});

export const updatePostSchema = Joi.object({
  caption: Joi.string().max(2200).optional().allow('').messages({
    'string.max': 'Caption must not exceed 2200 characters',
  }),

  location: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Location must not exceed 100 characters',
  }),
});

export const getPostsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 50',
  }),
});

import Joi from 'joi';

export const searchPostsSchema = Joi.object({
  q: Joi.string().min(1).required().messages({
    'string.min': 'Search query must not be empty',
    'any.required': 'Search query is required',
  }),

  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(50).optional().default(20).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 50',
  }),
});

export const globalSearchSchema = Joi.object({
  q: Joi.string().min(1).required().messages({
    'string.min': 'Search query must not be empty',
    'any.required': 'Search query is required',
  }),

  limit: Joi.number().integer().min(1).max(20).optional().default(5).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 20',
  }),
});

export const exploreQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(50).optional().default(20).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 50',
  }),
});

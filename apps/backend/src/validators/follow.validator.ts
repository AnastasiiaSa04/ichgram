import Joi from 'joi';

export const getFollowsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
});

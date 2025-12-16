import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name must not exceed 100 characters',
  }),

  bio: Joi.string().max(150).optional().allow('').messages({
    'string.max': 'Bio must not exceed 150 characters',
  }),
});

export const searchUsersSchema = Joi.object({
  q: Joi.string().min(1).required().messages({
    'string.min': 'Search query must not be empty',
    'any.required': 'Search query is required',
  }),

  limit: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 50',
  }),
});

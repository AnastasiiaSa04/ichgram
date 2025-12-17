import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required().trim().messages({
    'string.min': 'Comment content is required',
    'string.max': 'Comment must not exceed 500 characters',
    'any.required': 'Comment content is required',
  }),

  parentComment: Joi.string().optional().messages({
    'string.base': 'Parent comment ID must be a string',
  }),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required().trim().messages({
    'string.min': 'Comment content is required',
    'string.max': 'Comment must not exceed 500 characters',
    'any.required': 'Comment content is required',
  }),
});

export const getCommentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(50).optional().default(20).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 50',
  }),
});

import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  recipient: Joi.string().required().messages({
    'string.empty': 'Recipient is required',
    'any.required': 'Recipient is required',
  }),
  content: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Message content is required',
    'any.required': 'Message content is required',
    'string.min': 'Message content must be at least 1 character',
    'string.max': 'Message content must not exceed 1000 characters',
  }),
});

export const getConversationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const getMessagesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50),
});

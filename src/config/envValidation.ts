import * as Joi from 'joi';

export const envValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required().messages({
    'any.required': 'env variable DB_HOST is required.',
    'string.empty': 'env variable DB_HOST cannot be empty.',
  }),
  DB_PORT: Joi.number().required().messages({
    'any.required': 'env variable DB_PORT is required.',
    'number.base': 'env variable DB_PORT must be a number.',
  }),
  DB_USERNAME: Joi.string().required().messages({
    'any.required': 'env variable DB_USERNAME is required.',
  }),
  DB_PASSWORD: Joi.string().required().messages({
    'any.required': 'env variable DB_PASSWORD is required.',
  }),
  DB_DATABASE: Joi.string().required().messages({
    'any.required': 'env variable DB_DATABASE is required.',
  }),
});

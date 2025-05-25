import * as Joi from 'joi';

export const envValidation = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
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
  WOMPI_PRIVATE_KEY: Joi.string().required().messages({ 'any.required': 'WOMPI_PRIVATE_KEY es requerida.' }),
  WOMPI_PUBLIC_KEY: Joi.string().required().messages({ 'any.required': 'WOMPI_PUBLIC_KEY es requerida.' }),
  WOMPI_API_BASE_URL: Joi.string().uri().required().messages({
    'any.required': 'WOMPI_API_BASE_URL es requerida.',
    'string.uri': 'WOMPI_API_BASE_URL debe ser una URL válida.',
  }),
  WOMPI_INTEGRITY_KEY: Joi.string().optional(), // Puede ser opcional si no implementas webhooks
});

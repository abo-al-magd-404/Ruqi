import Joi from 'joi';
export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().port().default(8000),
    MONGODB_URI: Joi.string().uri().required(),
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.number().required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
    SEED_ADMIN_NAME: Joi.string().required(),
    SEED_ADMIN_EMAIL: Joi.string().email().required(),
    SEED_ADMIN_PASSWORD: Joi.string().min(8).required(),
    SEED_ADMIN_PHONE: Joi.string().required(),
    SEED_ADMIN_ADDRESS: Joi.string().required(),
    SEED_TEACHER_NAME: Joi.string().required(),
    SEED_TEACHER_EMAIL: Joi.string().email().required(),
    SEED_TEACHER_PASSWORD: Joi.string().min(8).required(),
    SEED_TEACHER_PHONE: Joi.string().required(),
    SEED_TEACHER_ADDRESS: Joi.string().required(),
    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().port().default(587),
    MAIL_USER: Joi.string().required(),
    MAIL_PASSWORD: Joi.string().required(),
    MAIL_FROM: Joi.string().required(),
    EMAIL_VERIFICATION_OTP_EXPIRES_IN: Joi.number().required(),
    EMAIL_VERIFICATION_OTP_RESEND_COOLDOWN: Joi.number().required(),
});
//# sourceMappingURL=validation.js.map
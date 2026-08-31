export default () => ({
  port: parseInt(process.env.PORT ?? '8000', 10),

  database: {
    mongodbUri: process.env.MONGODB_URI,
  },

  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN ?? '10', 10) * 60, // -> seconds
    },

    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn:
        parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '30', 10) * 24 * 60 * 60, // -> seconds
    },
  },

  seed: {
    admin: {
      name: process.env.SEED_ADMIN_NAME,
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      phoneNumber: process.env.SEED_ADMIN_PHONE,
      address: process.env.SEED_ADMIN_ADDRESS,
    },

    teacher: {
      name: process.env.SEED_TEACHER_NAME,
      email: process.env.SEED_TEACHER_EMAIL,
      password: process.env.SEED_TEACHER_PASSWORD,
      phoneNumber: process.env.SEED_TEACHER_PHONE,
      address: process.env.SEED_TEACHER_ADDRESS,
    },
  },

  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },

  emailVerification: {
    otpExpiresIn:
      parseInt(process.env.EMAIL_VERIFICATION_OTP_EXPIRES_IN ?? '10', 10) * 60, // minutes -> seconds
    otpResendCooldown: parseInt(
      process.env.EMAIL_VERIFICATION_OTP_RESEND_COOLDOWN ?? '60',
      10,
    ), // seconds
  },
});

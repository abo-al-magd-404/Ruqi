export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    mongodbUri: process.env.MONGODB_URI,
  },

  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    },

    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
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
    otpExpiresIn: process.env.EMAIL_VERIFICATION_OTP_EXPIRES_IN,
    otpResendCooldown: process.env.EMAIL_VERIFICATION_OTP_RESEND_COOLDOWN,
  },
});

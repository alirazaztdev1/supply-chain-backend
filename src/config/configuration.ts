export const configuration = () => ({
    environment: process.env.APP_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    mongoUrl: process.env.MONGO_URL,
    jwt: {
        secret: process.env.ACCESS_TOKEN_SECRET,
        salt: process.env.SALT || '10',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    frontendUrl: process.env.FRONTEND_URL,
    mailer: {
      service: process.env.NESTMAILER_SERVICE,
      user: process.env.NESTMAILER_USER,
      password: process.env.NESTMAILER_PASSWORD,
      adminEmail: process.env.NESTMAILER_ADMIN_EMAIL,
      fromEmail: process.env.NESTMAILER_FROM_EMAIL || process.env.NESTMAILER_FROM_ADDRESS
    }
});
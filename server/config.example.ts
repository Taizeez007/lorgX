// Configuration file template for database connections and API keys
// Copy this file to config.ts and fill in your actual values
// config.ts should be kept out of version control (added to .gitignore)

// Database configurations
export const dbConfig = {
  // MongoDB connection URI
  mongoDbUri: 'mongodb://localhost:27017/my-mongo-db',
  
  // Connection options
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

// Payment gateway configurations
export const paymentConfig = {
  stripe: {
    secretKey: 'sk_test_your_stripe_secret_key',
    publicKey: 'pk_test_your_stripe_public_key',
  },
  paystack: {
    secretKey: 'your_paystack_secret_key',
    publicKey: 'your_paystack_public_key',
  }
};

// Session configuration
export const sessionConfig = {
  secret: 'your-session-secret-key-here',
  cookieName: 'lorgx.sid',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// Other application configurations
export const appConfig = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
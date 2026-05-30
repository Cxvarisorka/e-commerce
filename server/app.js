// 3rd Modules
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Security and monitoring modules
const morgan = require('morgan');
const Sentry = require('@sentry/node');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require("hpp");

// Our modules

// Configs
const connectDB = require('./config/db.config');

// Controllers
const globalErrorHandler = require('./controllers/error.controller');

// Routers
const authRouter = require('./routers/auth.router');
const categoryRouter = require('./routers/category.router');
const productRouter = require('./routers/product.router');
const paymentRouter = require('./routers/payment.router');
const userRouter = require('./routers/user.router');
const oauthRouter = require('./routers/oauth.router');
const reviewRouter = require('./routers/review.router');
const commentRouter = require('./routers/comment.router');


// Security middlewares
const mongoSanitizeMiddleware = require('./middlewares/security.middleware');
const { globalLimiter, apiLimiter } = require('./config/rateLimit.config');

// ----------------------------------------------------------------------------------------

// Env init
dotenv.config();

// Sentry init
Sentry.init({
    dsn: process.env.SENTRY_URL,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
});

// Server init
const app = express();

// Logging requests
app.use(morgan('dev'))

// Security
app.use(globalLimiter);
app.use(hpp());

app.use('/api/payment/webhook', express.raw({ type: "application/json" }));

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);

app.use(express.static(path.join(__dirname, "./images")));

// Error handler
Sentry.setupExpressErrorHandler(app);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: "success",
        message: "Server is running!"
    });
});


app.use('/api', apiLimiter);

// Routers
app.use('/api/auth', authRouter);
app.use('/api/oauth', oauthRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/user', userRouter);
app.use('/api/review', reviewRouter);
app.use('/api/comment', commentRouter);


// Error handler
app.use(globalErrorHandler);

// Connect DB
connectDB();

// Listening for requests
app.listen(process.env.PORT, () => {
    console.log("Server is listening for requests!");
});

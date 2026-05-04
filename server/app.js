// Env init (must be first)
const dotenv = require('dotenv');
dotenv.config();

// 3rd Modules
const express = require('express');
const cors = require('cors');
const Sentry = require("@sentry/node");
const cookieParser = require('cookie-parser');

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

// ----------------------------------------------------------------------------------------

// Sentry init
Sentry.init({
    dsn: "https://a2c4e1a9685f522e320d3d0dbcfb082e@o4510668929826816.ingest.de.sentry.io/4511298815328336",
    sendDefaultPii: true,
});

// Server init
const app = express();

// Middlewares
app.use(cors({
    origin: "*" 
}));
app.use(express.json());
app.use(cookieParser());

// Error handler
Sentry.setupExpressErrorHandler(app);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: "success",
        message: "Server is running!"
    });
});

// Routers
app.use('/api/auth', authRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use("/api/payment", paymentRouter);

// Error handler
app.use(globalErrorHandler);

// Connect DB
connectDB();

// Listening for requests
app.listen(process.env.PORT, () => {
    console.log("Server is listening for requests!");
});

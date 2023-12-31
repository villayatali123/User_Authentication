require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

//Interceptor
const interceptor = require("express-interceptor");
///extra security packages

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");

//  Api Throttling/Rate limiter
const rateLimiter = require("express-rate-limit");

const authenticateUser = require("./middleware/authentication");

//connect DB

const connectDB = require("./db/connect");

//router
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/product");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// extra security packages
app.set("trust proxy", 1);

//Middlewares
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15Minutes
    max: 100,
  })
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// routes

app.get("/", (req, res) => {
  res.send("Welcome to beginning of nothingness");
});

const requestInterceptor = interceptor((req, res) => ({
  // Process the request object
  isInterceptable: () => true, // Allow all requests to be intercepted
  intercept: (body, send) => {
    console.log(`Incoming ${req.method} request to ${req.path}`);
    send(body);
  },
}));

// Use the interceptor middleware
app.use(requestInterceptor);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    console.log("hello");
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

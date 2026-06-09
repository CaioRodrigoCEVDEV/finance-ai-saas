const express = require('express');
const cookieParser = require('cookie-parser');

const corsMiddleware = require('./config/cors');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error-handler');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

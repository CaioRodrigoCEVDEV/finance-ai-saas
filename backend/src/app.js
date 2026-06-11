const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const corsMiddleware = require('./config/cors');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rate-limiter');
const { errorHandler, notFoundHandler } = require('./middlewares/error-handler');

const app = express();

app.set('trust proxy', 1);

const cspDisabled = env.nodeEnv === 'development'
  ? { contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }
  : {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", env.frontendUrl]
        }
      }
    };

app.use(helmet({
  ...cspDisabled,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(compression());

app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(corsMiddleware);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cookieParser());

app.use(apiLimiter);

app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  immutable: true
}));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

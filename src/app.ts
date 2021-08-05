import 'reflect-metadata';
import * as Sentry from '@sentry/node';
import * as path from 'path';
import express from 'express';
import helmet from 'helmet';
import { container } from 'tsyringe';
// import cors from 'cors';
// import bodyparser from 'body-parser';
// import compression from 'compression';
import { ApolloServer } from 'apollo-server-express';
import { createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import initialize from './initializers';
import ConfirmEmailService from './services/ConfirmEmailService';
import ApolloContext from './types/apolloContext';

[
    'NODE_ENV',
    //
    'MYSQL_HOST',
    'MYSQL_PORT',
    'MYSQL_USER_NAME',
    'MYSQL_PASSWORD',
    'MYSQL_DB_NAME',
    //
    'SENDGRID_API_KEY',
    'SITE_URL',
    'PORT',
    'SENTRY_DSN',
    //
    'REFERRAL_BUMP',
    //
    'PRODUCT_NAME',
    'PRODUCT_URL',
    //
    'SMTP_PROVIDER',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER_SECURE',
    'SMTP_USER_DISPLAY',
    'SMTP_USER_EMAIL',
    'SMTP_USER_PASSWORD',
].map((k) => { if (!process.env[k]) throw new Error(`Missing required ENV: ${k}`); }); // eslint-disable-line array-callback-return

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

const app = express();
app.use(Sentry.Handlers.requestHandler());
app.use(helmet({ contentSecurityPolicy: false }));
// app.use(cors());
// app.use(compression());
app.use(Sentry.Handlers.errorHandler());
app.enable('trust proxy');

app.get('/confirmEmail', (req, res) => container.resolve(ConfirmEmailService).run({ req, res }));

(async () => {
  await createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.MYSQL_USER_NAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    synchronize: true,
    entities: [path.join(__dirname, 'entities/*')],
    logging: process.env.NODE_ENV !== 'production',
    extra: process.env.NODE_ENV !== 'production' ? undefined : { ssl: { rejectUnauthorized: false } },
  });

  await initialize();

  const schema = await buildSchema({
    resolvers: [path.join(__dirname, 'resolvers/*')],
    container: { get: (cls) => container.resolve(cls) },
  });

  const server = new ApolloServer({
    schema,
    introspection: true,
    context: (c): ApolloContext => ({ ip: c.req.ip }),
  });

  server.applyMiddleware({ app });
})();

export default app;

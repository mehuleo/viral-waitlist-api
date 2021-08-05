module.exports = {
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER_NAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    synchronize: true,
    logging: false,
    migrationsTableName: 'migrations',

    extra: process.env.NODE_ENV !== 'production' ? undefined : {
        ssl: {
            rejectUnauthorized: false
        }
    },
    synchronize: false,
    logging: false,
    entities: ['src/entities/**/*.ts'],
    migrationsTableName: 'migration',
    migrations: ['migrations/**/*.ts'],
    cli: {
        migrationsDir: 'migrations'
    },
};
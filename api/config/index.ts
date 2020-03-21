import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../.env' )});

export = {
    server: {
        port: process.env.SERVER_PORT || 3000,
        env: process.env.SERVER_ENV || 'development', // production, development
        enableCors: process.env.ENABLE_CORS,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'EXAMPLE_SECRET',
        options: {
            expiresIn: '20d',
        },
    },
}

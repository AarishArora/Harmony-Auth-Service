import {config as dotenvConfig} from "dotenv";

dotenvConfig()

const _config = {
    MONGO_URI : process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID:process.env.CLIENT_ID ,
    CLIENT_SECRET: process.env.CLIENT_SECRET ,
    RABBITMQ_URI: process.env.RABBITMQ_URI,
    FRONTEND_URL: process.env.FRONTEND_URL,
    AUTH_URL: process.env.AUTH_URL,
    MUSIC_URL : process.env.MUSIC_URL,
    GOOGLE_URI: process.env.GOOGLE_URI,
    PORT : process.env.PORT,
}

export default _config;
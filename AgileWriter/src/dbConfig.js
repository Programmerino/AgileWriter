require('dotenv').config();
const isProduction = process.env.NODE_ENV === "production";

const { Pool } = require("pg");
const { parse } = require("pg-connection-string");
const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
const config = parse(isProduction ? process.env.DATABASE_URL : connectionString);
if (isProduction) config.ssl = {rejectUnauthorized: false};
const postgres = new Pool(config);
postgres.connect();
module.exports = postgres;
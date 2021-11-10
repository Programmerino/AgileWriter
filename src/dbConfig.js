require('dotenv').config();
const { Pool } = require("pg");
const isProduction = process.env.NODE_ENV === "production";
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const postgres = new Pool({ connectionString: isProduction ? process.env.DATABASE_URL : connectionString });
if (isProduction) pg.defaults.ssl = {rejectUnauthorized: false};
module.exports = { postgres };
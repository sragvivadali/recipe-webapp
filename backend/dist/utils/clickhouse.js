"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clickhouse = void 0;
// utils/clickhouse.ts
const client_1 = require("@clickhouse/client");
exports.clickhouse = (0, client_1.createClient)({
    host: 'https://fl9q4tcjuq.us-east1.gcp.clickhouse.cloud:8443',
    username: 'default',
    password: process.env.CLICKHOUSE_PWD,
    database: 'default', // or whatever DB you're using
});

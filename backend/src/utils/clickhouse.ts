
// utils/clickhouse.ts
import { createClient } from '@clickhouse/client';

export const clickhouse = createClient({
  host: 'https://fl9q4tcjuq.us-east1.gcp.clickhouse.cloud:8443',
  username: 'default',
  password: process.env.CLICKHOUSE_PWD,
  database: 'default', // or whatever DB you're using
});

import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize(process.env.RDS_URL!, { dialect: 'postgres' });
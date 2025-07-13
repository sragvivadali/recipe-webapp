import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export class Recipe extends Model {}

Recipe.init({
  title: { type: DataTypes.STRING, allowNull: false },
  chef: { type: DataTypes.STRING, allowNull: false },
  ingredients: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'recipe' });

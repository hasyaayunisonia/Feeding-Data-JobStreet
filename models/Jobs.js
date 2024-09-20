const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Jobs = sequelize.define('Jobs', {
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classification : {
    type: DataTypes.STRING,
  },
  subclassification: {
    type: DataTypes.STRING,
  },
  salary: {
    type: DataTypes.STRING,
  },
  work_type: {
    type: DataTypes.STRING,
  },
  teaser: {
    type: DataTypes.STRING,
  },
  work_arrangements: {
    type: DataTypes.TEXT,
  },
  other_info: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: false
});

module.exports = Jobs;

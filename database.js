const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("Db_Jobs", "your_username", "your_password", {
  host: "localhost",
  dialect: "your_username",
});

module.exports = sequelize;

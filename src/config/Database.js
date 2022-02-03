import sequelize from "sequelize";

const DB = new sequelize("expressjwt", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default DB;

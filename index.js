import express from "express";
import cookieParser from "cookie-parser";
import DB from "./src/config/Database.js";
import cors from "cors";
import router from "./src/routes/index.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
try {
  await DB.authenticate();
  console.log("Database connected successfully.");
} catch (error) {
  console.error("Unable to connect to the database");
}

const PORT = 5000;

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

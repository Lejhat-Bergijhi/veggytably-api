import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import "express-async-errors";
import routes from "./api/routes/index";
import { connectDB } from "./config/db";
import globalErrorHandler from "./api/middlewares/globalErrorHandler";

const app = express();
app.use(express.json());
connectDB();

app.use("/", routes);
app.use("*", globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on ${process.env.NODE_ENV} env at port ${process.env.PORT}.`
  );
});

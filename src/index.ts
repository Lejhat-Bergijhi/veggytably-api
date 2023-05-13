import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";

import "express-async-errors";
import cors from "cors";
import routes from "./api/routes/index";
import { connectDB } from "./config/db";
import globalErrorHandler from "./api/middlewares/globalErrorHandler";

import { socketManager } from "./config/socket";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// init
connectDB();
socketManager.init(server);

app.use("/", routes);
app.use("*", globalErrorHandler);

server.listen(process.env.PORT, () => {
  console.log(
    `env: ${process.env.NODE_ENV} | listening on *: ${process.env.PORT}.`
  );
});

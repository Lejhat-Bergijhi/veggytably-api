import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

// import routes from "./api/routes/index";

const app = express();
app.use(express.json());

// app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on ${process.env.NODE_ENV} env at port ${process.env.PORT}.`
  );
});

import { Router } from "express";
import merchantRoute from "./merchantRoute";

const router = Router();

router.get("/", (req, res) => {
  res.json("Vegytably API");
});

router.use("/merchants", merchantRoute);

export default router;

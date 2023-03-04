import { Router } from "express";
import merchantRoute from "./merchantRoute";
import authRoute from "./authRoute";

const router = Router();

router.get("/", (req, res) => {
  res.json("Vegytably API");
});

router.use("/merchants", merchantRoute);
router.use("/auth", authRoute);

export default router;

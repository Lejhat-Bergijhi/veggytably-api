import { Router } from "express";
import merchantRoute from "./merchantRoute";
import customerRoute from "./customerRoute";
import authRoute from "./authRoute";

const router = Router();

router.get("/", (req, res) => {
  res.json("Vegytably API");
});

router.use("/customers", customerRoute);
router.use("/merchants", merchantRoute);
router.use("/auth", authRoute);

export default router;

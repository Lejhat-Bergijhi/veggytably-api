import { Router } from "express";
import merchantRoute from "./merchantRoute";
import customerRoute from "./customerRoute";
import authRoute from "./authRoute";
import cmsRoute from "./cmsRoute";
import transactionRoute from "./transactionRoute";

const router = Router();

router.get("/", (req, res) => {
  res.json("Veggytably API");
});

router.use("/customers", customerRoute);
router.use("/merchants", merchantRoute);
router.use("/auth", authRoute);
router.use("/cms", cmsRoute);
router.use("/transactions", transactionRoute);

export default router;

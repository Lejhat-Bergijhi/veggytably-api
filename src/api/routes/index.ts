import { Router } from "express";
import merchantRoute from "./merchantRoute";
import customerRoute from "./customerRoute";
import authRoute from "./authRoute";
import cmsRoute from "./cmsRoute";

const router = Router();

router.get("/", (req, res) => {
  res.json("Veggytably API");
});

router.use("/customers", customerRoute);
router.use("/merchants", merchantRoute);
router.use("/auth", authRoute);
router.use("/cms", cmsRoute);

export default router;

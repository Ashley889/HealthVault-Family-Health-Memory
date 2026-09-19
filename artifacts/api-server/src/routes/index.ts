import { Router, type IRouter } from "express";
import healthRouter from "./health";
import healthvaultRouter from "./healthvault";

const router: IRouter = Router();

router.use(healthRouter);
router.use(healthvaultRouter);

export default router;

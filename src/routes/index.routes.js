import { Router } from "express";
import transactionRouter from "./transactions.routes.js";
import userRouter from "./users.routes.js";

const router = Router()

router.use(userRouter)
router.use(transactionRouter)

export default router
import { Router } from "express"
import { newTransaction, getTransactions } from "../controllers/transaction.controllers.js"
import { validateSchema } from "../middlewares/validateSchema.middleware.js"
import { transactionSchema } from "../schemas/transaction.schemas.js"
import validateToken from "../middlewares/validateToken.middleware.js"

const transactionRouter = Router()

transactionRouter.post("/transactions", validateSchema(transactionSchema),validateToken, newTransaction)

transactionRouter.get("/transactions", validateToken, getTransactions)

export default transactionRouter
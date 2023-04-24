import { signup, signin } from "../controllers/user.controllers.js"
import { validateSchema } from "../middlewares/validateSchema.middleware.js"
import { Router } from "express"
import { userSchema, loginSchema } from "../schemas/user.schemas.js"

const userRouter = Router()

userRouter.post("/cadastro", validateSchema(userSchema), signup)

userRouter.post("/", validateSchema(loginSchema), signin)

export default userRouter
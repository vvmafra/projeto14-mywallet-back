import bcrypt from "bcrypt"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import joi from "joi"
import { MongoClient, ObjectId } from "mongodb"
import { v4 as uuid} from "uuid"

//Server Creation

const app = express()

//Configs
app.use(cors())
app.use(express.json())
dotenv.config()

// DB Connection
const mongoClient = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoClient.connect()
} catch (err) {
    console.log(err.message)
}

const db = mongoClient.db()

const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    passwordConfirmation: joi.string().min(3).required()
})

app.post("/cadastro", async (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body

    const validation = userSchema.validate(req.body, {abortEarly: false})

    if (validation.error) {
        const errors = validation.error.details.map((det) => det.message)
        return res.status(422).send(errors)
    }

    if (password !== passwordConfirmation) return res.status(422).send("Passwords don't match")

    try {
        const emailRegister = await db.collection("users").findOne({email})
        if (emailRegister) return res.status(409).send("Email already registered")

        const hash = bcrypt.hashSync(password, 10)

        await db.collection("users").insertOne({name, email, password: hash, passwordConfirmation: hash})
        res.status(201).send("Successfully registered user")
    }

    catch (err){
        res.status(500).send(err.message)
    }

})







const PORT = 5000
app.listen(PORT, () => console.log(`Using port ${PORT}`))
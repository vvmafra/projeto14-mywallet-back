import bcrypt from "bcrypt"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import joi from "joi"
import { MongoClient, ObjectId } from "mongodb"
import { v4 as uuid} from "uuid"
import dayjs from "dayjs"

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

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
})

const transactionSchema = joi.object({
    amount: joi.number().required().positive().precision(2),
    description: joi.string().required(),
    typeTransaction: joi.string().required()
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

app.post("/", async (req, res) => {
    const { email, password } = req.body
    const validation = loginSchema.validate(req.body, {abortEarly: false})

      if (validation.error) {
        const errors = validation.error.details.map((det) => det.message)
        return res.status(422).send(errors)
    }

    try {
        const username = await db.collection("users").findOne({email})
        if(!username) return res.status(404).send("User not found")

        const checkPassword = bcrypt.compareSync(password, username.password)
        if(!checkPassword) return res.status(401).send("Password does not match")

        const token = uuid()
        await db.collection("sessions").insertOne({token, idUser: username._id})
        res.status(200).send(token)
    }
    catch {
        res.sendStatus(500)
    }


})

app.post("/nova-transacao/:tipo", async (req, res) => {
    const { amount, description } = req.body
    const { tipo: typeTransaction } = req.params
    const id = res.locals.id;

    const validation = transactionSchema.validate(req.body, {abortEarly: false})

    if (validation.error) {
        const errors = validation.error.details.map((det) => det.message)
        return res.status(422).send(errors)
    }

    try {
        await db.collection("transactions").insertOne({
            idUser: id,
            amount: Number(amount).toFixed(2),
            description,
            typeTransaction,
            data: dayjs().format("DD/MM")
        })
        return res.status(201).send("Added transaction sucessfully")
    } catch (err) {
        res.status(500).send(err.message)
    }

})

app.get("/home", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.status(401).send("You don't have authorization to check those transactions")


    try {
        const sessions = await db.collection("sessions").findOne({token})

        if (!sessions) return res.sendStatus(401)

        const transactions = await db.collection("transactions").find({idUser: sessions.idUser}).toArray()
        res.send(transactions)
    } catch (err) {
        res.status(500).send(err.message)
    }

})






const PORT = 5000
app.listen(PORT, () => console.log(`Using port ${PORT}`))
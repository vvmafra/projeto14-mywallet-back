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







const PORT = 5000
app.listen(PORT, () => console.log(`Using port ${PORT}`)d)
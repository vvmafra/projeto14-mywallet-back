import cors from "cors"
import dotenv from "dotenv"
import express from "express"

import { MongoClient, ObjectId } from "mongodb"
import router from "./routes/index.routes.js"


//Server Creation

const app = express()

//Configs
app.use(cors())
app.use(express.json())
app.use(router)
dotenv.config()

// DB Connection
const mongoClient = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoClient.connect()
} catch (err) {
    console.log(err.message)
}

export const db = mongoClient.db()









const PORT = 5000
app.listen(PORT, () => console.log(`Using port ${PORT}`))
import { db } from "../database/database.connection.js";
import {v4 as uuid} from "uuid"
import bcrypt from "bcrypt"


export async function signup(req, res){
    const { name, email, password, passwordConfirmation } = req.body

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
}

export async function signin (req, res) {
    const { email, password } = req.body


    try {
        const username = await db.collection("users").findOne({email})
        if(!username) return res.status(404).send("User not found")

        const checkPassword = bcrypt.compareSync(password, username.password)
        if(!checkPassword) return res.status(401).send("Password does not match")

        const token = uuid()
        await db.collection("sessions").insertOne({token, idUser: username._id})
        res.status(200).send({name: username.name,token, idUser: username._id})
    }
    catch {
        res.sendStatus(500)
    }


}
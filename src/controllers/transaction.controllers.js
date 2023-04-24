import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function newTransaction (req, res) {
    const { amount, description, typeTransaction} = req.body
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "")

    try {
        const sessions = await db.collection("sessions").findOne({token})

        if (!sessions) return res.sendStatus(401)

        await db.collection("transactions").insertOne({
            idUser: sessions.idUser,
            amount: Number(amount).toFixed(2),
            description,
            typeTransaction,
            data: dayjs().format("DD/MM")
        })
        return res.status(201).send("Added transaction sucessfully")
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getTransactions(req, res){
    try {
        const token = res.locals.token
        const sessions = await db.collection("sessions").findOne({token})

        if (!sessions) return res.sendStatus(401)

        const transactions = await db.collection("transactions").find({idUser: sessions.idUser}).toArray()
        res.send(transactions)
    } catch (err) {
        res.status(500).send(err.message)
    }

}
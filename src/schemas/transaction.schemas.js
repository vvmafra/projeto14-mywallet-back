import joi from "joi"

export const transactionSchema = joi.object({
    amount: joi.number().required().positive().precision(2),
    description: joi.string().required(),
    typeTransaction: joi.string().required()
})
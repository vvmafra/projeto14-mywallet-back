export default function validateToken (req, res, next) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.status(401).send("You don't have authorization to check those transactions")

    res.locals.token = token

    next()
}
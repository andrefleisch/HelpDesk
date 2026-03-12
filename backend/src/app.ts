import express from "express"
import cors from "cors"

export const app = express()

app.use(cors())
app.use(express.json())

// app.use("/users", require("./routes/users"))
app.use("/tickets", require("./routes/ticket"))
// app.use("/comments", require("./routes/comment"))

app.get("/health", (_req, res) => {
    res.status(200).json({message: "API Funcionando"})
})





import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import authRouter from "./routes/auth.routes.js"
import consultationRouter from "./routes/consultation.routes.js"

//routes declaration
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/consultations", consultationRouter)

// Centralized error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors: err.errors || [],
    });
});

export { app }
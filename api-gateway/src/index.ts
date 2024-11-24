import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { configureRoutes } from './utils'

dotenv.config()

const app = express()

// security middleware
app.use(helmet())

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (_req, res) => {
        res.status(429).json({message: 'Too many requests, please try again later.'})
    }
})

app.use('/api', limiter)

// request logger
app.use(morgan("dev"))
app.use(express.json())

// TODO: Auth Middleware

// routes
configureRoutes(app)

// 404 handler
app.use((_req, res) => {
    return res.status(404).json({message: 'Not found'})
})

app.get('/health',(_req, res) => {
    res.status(200).json({message: 'API Gateway is running'})
})

app.use((err, _req, res, _next) => {
    console.log(err.stack)
    res.status(500).json({message: 'Internal Server Error'})
})

const port = process.env.PORT || 8081
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`)
})

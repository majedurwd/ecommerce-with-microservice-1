import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import {
	userLogin,
	verifyToken,
	userRegistration,
	verifyEmail,
} from "./controllers";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "UP" });
});

// app.use((req, res, next) => {
//     const allowedOrigin = ['http://localhost:8081', 'http://127.0.0.1:8081']
//     const origin = req.headers.origin || ''
//     if (allowedOrigin.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
//         next()
//     } else {
//         res.setHeader('Access-Control-Allow-Origin', origin)
//         return res.status(403).json({message: 'Forbidden'})
//     }
// })

// routes
app.post("/auth/registration", userRegistration);
app.post("/auth/login", userLogin);
app.post("/auth/verify-token", verifyToken);
app.post("/auth/verify-email", verifyEmail);

// 404 Handler
app.use((_req, res) => {
	res.status(404).json({ message: "Not found" });
});

// Error Handler
app.use((err, _req, res, _next) => {
	console.error(err.stack);
	res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 4003;
const serviceName = process.env.SERVICE_NAME || "Auth-service";

app.listen(port, () => {
	console.log(`${serviceName} is running on port ${port}`);
});

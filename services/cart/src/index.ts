import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import './events/onKeyExpires';
import { addToCartHandler, clearCartHandler, getMyCartHandler } from "./controllers";

dotenv.config();

const app = express();

// security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	handler: (_req, res) => {
		res.status(429).json({
			message: "Too many requests, please try again later.",
		});
	},
});

app.use("/api", limiter);

// request logger
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
	res.status(200).json({ message: "Cart Service is running" });
});

// TODO: Auth Middleware

// routes
app.post('/api/cart/add-to-cart', addToCartHandler)
app.get('/api/cart/me', getMyCartHandler)
app.get('/api/cart/clear', clearCartHandler)

// 404 handler
app.use((_req, res) => {
	return res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
	console.log(err.stack);
	res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.PORT || 4006;
const serviceName = process.env.SERVICE_NAME || "Cart-service";

app.listen(port, () => {
	console.log(`${serviceName} is running on port ${port}`);
});

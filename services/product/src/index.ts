import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import cors from "cors"
import {
	createProduct,
	getProductDetails,
	getProducts,
	updateProduct,
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
app.get("/products/:id", getProductDetails);
app.put("/products/:id", updateProduct);
app.get("/products", getProducts);
app.post("/products", createProduct);

// 404 Handler
app.use((_req, res) => {
    res.status(404).json({message: "Not found"})
})

// Error Handler
app.use((err, _req, res, _next) => {
    console.error(err.stack)
    res.status(500).json({message: "Internal server error"})
})


const port = process.env.PORT || 4001
const serviceName = process.env.SERVICE_NAME || "Product-service"


app.listen(port, () => {
    console.log(`${serviceName} is running on port ${port}`)
})
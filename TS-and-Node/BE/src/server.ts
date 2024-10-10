import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from "express";
import AppError from "./utils/AppError";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

import ProductsRoutes from "./routes/ProductsRoutes"

const app: Express = express();
app.use(express.json());

// Middleware
// for parsing application/json
app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({extended : true}))

app.use(cors());

app.use(morgan('dev'));

// Routes
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the Product API"
    });
})

// passing the all routes to endpont
app.use("/api/v1/products", ProductsRoutes);


// Handle undefined routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find ${req.method} ${req.url} on this server`, 404));
});

// Define custom error interface
interface AppErrorInstance extends ErrorRequestHandler {
    message: string;
    statusCode: number;
    status?: string;
}

// Global error handler
app.use((err: AppErrorInstance, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    res.status(statusCode).json({
        status,
        message: err.message || "Internal Server Error",
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import express, { Request, Response } from 'express';
import { getXataClient } from './xata'; // Adjust the import path based on your structure

const app = express();
const xata = getXataClient();
app.use(express.json());

// Get all events
app.get("/api/v1/products", async (req: Request, res: Response): Promise<void> => {
    try {
        const records = await xata.db.Products.getAll()
        res.status(200).json(records);
    } catch (error: any) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// Get an Product by ID
app.get("/api/v1/products/:id", async (req: Request, res: Response): Promise<void> => {
    const productId: string = req.params.id;
    try {
        const record = await xata.db.Products.read(productId);
        if (!record) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json(record);
    } catch (error: any) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// Create a new Product
app.post("/api/v1/products", async (req: Request, res: Response): Promise<void> => {
    try {
        await xata.db.Products.create(req.body)
        res.status(201).json({ message: "Product created successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// Update an product by ID
app.put("/api/v1/products/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        await xata.db.Products.update(req.body); 
        res.status(200).json({ message: "Event updated successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// Delete a product by ID
app.delete("/api/v1/products/:id", async (req: Request, res: Response): Promise<void> => {
    const eventID = req.params.id;
    try {
        await xata.db.Products.delete(eventID); 
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
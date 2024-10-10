import express from "express";
import { body } from "express-validator";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
} from "../controllers/ProductsController";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(
    [
      body("company").isLength({ min: 5 }),
      body("date").isLength({ min: 5 }),
      body("imageUrl").isLength({ min: 5 }),
      body("location").isLength({ min: 5 }),
      body("price").isLength({ min: 5 }),
      body("title").isLength({ min: 5 }),
    ],
    createProduct
  );

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(
    [
      body("company").isLength({ min: 5 }),
      body("date").isLength({ min: 5 }),
      body("imageUrl").isLength({ min: 5 }),
      body("location").isLength({ min: 5 }),
      body("price").isLength({ min: 5 }),
      body("title").isLength({ min: 5 }),
    ],
    updateProduct
  )
  .delete(deleteProduct);

router.route("/:phrase").get(searchProduct);

export default router;

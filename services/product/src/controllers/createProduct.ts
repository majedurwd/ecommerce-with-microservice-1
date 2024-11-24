import { Request, Response, NextFunction } from 'express'
import prisma from '../prisma'
import axios from 'axios'
import { ProductCreateDTOSchema } from '../schemas'
import { INVENTORY_URL } from '../config'

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const parsedBody = ProductCreateDTOSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                error: parsedBody.error.errors
            })
        }

        // check if product with the same sku already exists
        const existsProduct = await prisma.product.findFirst({
            where: {
                sku: parsedBody.data.sku
            }
        })

        if (existsProduct) {
            return res.status(400).json({
                message: "Product with the same sku already exists"
            })
        }

        // Create product
        const product = await prisma.product.create({
            data: parsedBody.data
        })
        console.log("Product created successfully", product.id)

        // Create inventory record for the product

        console.log(`${INVENTORY_URL}/inventories`)
        const { data: inventory } = await axios.post(`${INVENTORY_URL}/inventories`, {
            productId: product.id,
            sku: product.sku
        })
        console.log("Inventory created successfully", inventory.id)

        await prisma.product.update({
            where: { id: product.id },
            data: {inventoryId: inventory.id}
        })
        console.log("Product updated successfully with inventory id", inventory.id)

        return res.status(201).json({...product, inventoryId: inventory.id})

    } catch (error) {
        next(error)
    }
}

export default createProduct

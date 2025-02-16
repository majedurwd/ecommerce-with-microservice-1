import prisma from '../prisma'
import { ProductUpdateDTOSchema } from '../schemas'
import {Request, Response, NextFunction} from 'express'

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const parsedBody = ProductUpdateDTOSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                error: parsedBody.error.errors
            })
        }

        const { id } = req.params
        const product = await prisma.product.findUnique({
            where: { id },
        })
        if (!product) {
            return res.status(404).json({message: "Product not found"})
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: parsedBody.data
        })

        return res.status(200).json({message: "Product updated successfully", data: updatedProduct})
    } catch (error) {
        next(error)
    }
}

export default updateProduct
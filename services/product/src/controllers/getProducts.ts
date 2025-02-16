import { Request, Response, NextFunction } from 'express'
import prisma from '../prisma'


const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Origin", req.headers.origin);
        const products = await prisma.product.findMany({
            select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                inventoryId: true
            }
        })

        // TODO: Implement pagination
        // TODO: Implement filtering

        return res.status(200).json({data: products})
    } catch (error) {
        next(error)
    }
}

export default getProducts
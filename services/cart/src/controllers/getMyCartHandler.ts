import { redis } from '../redis'
import { Request, Response, NextFunction } from 'express'


const getMyCartHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartSessionId = (req.headers["x-cart-session-id"] as string) || null
        if (!cartSessionId) {
            return res.status(200).json({ data: [] })
        }

        // Check if cart session id exists in the store
        const exists = await redis.exists(`sessions:${cartSessionId}`)
        if (!exists) {
            await redis.del(`carts:${cartSessionId}`)
            return res.status(200).json({ data: [] })
        }

        const items = await redis.hgetall(`carts:${cartSessionId}`)

        if (Object.keys(items).length === 0) {
            return res.status(200).json({ data: [] })
        }

        const formattedItems = Object.keys(items).map(key => {
            const { quantity, inventoryId} = JSON.parse(items[key]) as { quantity: number, inventoryId: string }
            return {
                productId: key,
                inventoryId,
                quantity
            }
        })

        return res.status(200).json({ items: formattedItems })

    } catch (error) {
        next(error)
    }
}

export default getMyCartHandler
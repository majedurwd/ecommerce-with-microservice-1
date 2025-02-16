import { redis } from '../redis';
import { Request, Response, NextFunction } from 'express';

const clearCartHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const cartSessionId = (req.headers["x-cart-session-id"] as string) || null
        if (!cartSessionId) {
            return res.status(200).json({message: "Cart is empty"})
        }

        // Check if cart session id exists in the store
        const exists = await redis.exists(`sessions:${cartSessionId}`)
        if (!exists) {
            delete req.headers["x-cart-session-id"]
            return res.status(200).json({message: "Cart is empty"})
        }

        // Clear the cart
        await redis.del(`sessions:${cartSessionId}`);
        await redis.del(`carts:${cartSessionId}`);
        delete req.headers["x-cart-session-id"]
        return res.status(200).json({ message: "Cart cleared successfully" });
        
    } catch (error) {
        next(error);
    }
}

export default clearCartHandler
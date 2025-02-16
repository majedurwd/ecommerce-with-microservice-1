import axios from 'axios';
import { CART_TTL, INVENTORY_SERVICE } from '../config';
import { redis } from '../redis';
import { CartItemSchema } from '../schemas';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';


const addToCartHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Validate the request body
        const parsedBody = CartItemSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Request body validation failed",
                error: parsedBody.error.errors
            });
        }

        let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

        // Check if cart session id is present in the request header and exists in the store
        if (cartSessionId) {
            const exists = await redis.exists(`sessions:${cartSessionId}`)
            console.log('Session Exists: ', exists)

            if (!exists) {
                cartSessionId = null
            }
        }

        // If cart session id is not present, create a new one
        if (!cartSessionId) {
            cartSessionId = uuid()
            console.log('New cart session id: ', cartSessionId)

            // Set the cart session id in the redis store
            await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId)

            // Set the cart session id in the response header
            res.setHeader("x-cart-session-id", cartSessionId)
        }

        // Check if the inventory is available 
        const { data } = await axios.get(`${INVENTORY_SERVICE}/inventories/${parsedBody.data.inventoryId}`)

        if (data.quantity < parsedBody.data.quantity) {
            return res.status(400).json({ message: "Inventory not available" })
        }

        // TODO: Check if the item already exists in the cart

        // Add the item to the cart
        await redis.hset(`carts:${cartSessionId}`, parsedBody.data.productId, JSON.stringify({
            inventoryId: parsedBody.data.inventoryId,
            quantity: parsedBody.data.quantity
        }))

        // Update the inventory quantity
        await axios.put(`${INVENTORY_SERVICE}/inventories/${parsedBody.data.inventoryId}`, {
            quantity: parsedBody.data.quantity,
            actionType: "OUT"
        })

        return res.status(201).json({ message: "Item added to cart", cartSessionId })

    } catch (error) {
        next(error)
    }
}

export default addToCartHandler
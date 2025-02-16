import axios from "axios";
import { redis } from "../redis";
import { INVENTORY_SERVICE } from "../config";

const clearCart = async (id: string) => {
    try {

        const data = await redis.hgetall(`carts:${id}`)
        if (Object.keys(data).length < 1) { 
            return
        }
    
        const items = Object.keys(data).map(key => {
            const { quantity, inventoryId } = JSON.parse(data[key]) as {
                quantity: number, inventoryId: string
            }
            return {
                productId: key,
                inventoryId,
                quantity
            }
        })
    
        const requests = items.map(item => {
            return axios.put(`${INVENTORY_SERVICE}/inventories/${item.inventoryId}`, {
                quantity: item.quantity,
                actionType: "IN"
            })
        })
    
        Promise.all(requests)
        console.log('Inventory updated')
    
        // clear the cart
        await redis.del(`carts:${id}`)


    } catch (error) {
        console.log(error)
    }

}

export default clearCart
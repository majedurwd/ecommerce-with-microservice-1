import { REDIS_HOST, REDIS_PORT } from '../config';
import { Redis } from 'ioredis';
import clearCart from '../services';


const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
})


const CHANNEL_KEY = '__keyevent@0__:expired';

redis.config('SET', 'notify-keyspace-events', 'Ex');
redis.subscribe(CHANNEL_KEY)

redis.on('message', async (channel, key) => {
    if (channel === CHANNEL_KEY) {
        console.log('Key expired: ', key)

        const cartKey = key.split(':')[1]
        if (!cartKey) return
        
        clearCart(cartKey)
    }
})
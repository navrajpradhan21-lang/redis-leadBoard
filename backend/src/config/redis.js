import {createClient} from 'redis';

// creating a redis client 
const redisClient = createClient({
    url:process.env.REDIS_URL
});

redisClient.on("error",(error)=>{
    console.log("Redis Error",error);
});

const redisSubscriber = redisClient.duplicate();

redisSubscriber.on("error",(error)=>{
    console.error("Redis subscriber error",error)
})

const connectRedis = async()=>{
    await redisClient.connect();
    await redisSubscriber.connect();

    console.log("Redis Connected")
};

export {redisClient,redisSubscriber,connectRedis};

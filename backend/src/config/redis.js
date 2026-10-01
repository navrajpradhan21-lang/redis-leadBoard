import Redis from "ioredis";


const redisClient = new Redis(process.env.REDIS_URL);

const redisSubscriber = new Redis(process.env.REDIS_URL);

redisClient.on("error",(error)=>{
    console.log('Redis Client error:',error)
})

redisSubscriber.on("error",(error)=>{
    console.log("Redis subscriber error",error);

});

export {
    redisClient,
    redisSubscriber
}

import {createClient} from 'redis';

// creating a redis client 
const redisClient = createClient({
    url:process.env.REDIS_URL
});

redisClient.on("error",(error)=>{
    console.log("Redis Error",error);
});


const connectRedis = async()=>{
    await redisClient.connect();
    console.log("Redis Connected")
};

export {redisClient,connectRedis};

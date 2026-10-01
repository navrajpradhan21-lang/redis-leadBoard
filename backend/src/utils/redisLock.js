import { randomUUID } from "node:crypto";
import { redisClient } from "../config/redis.js";

const RELEASE_SCRIPT = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
    end

    return 0
`;
export const acquireLock = async(key, ttl = 5000)=>{
    const token = randomUUID();
    const result = await redisClient.set(
        key,
        token,
        "PX",
        ttl,
        "NX"
    )
    if (result!=="OK"){
        return null;

    }
    return token ;

}

export const releaseLock = async(key,token)=>{
    
        if(!token) return;
        await redisClient.eval(
            RELEASE_SCRIPT,
            1,
            key,
            token
        );
};

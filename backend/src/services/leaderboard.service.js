import Lead from "../models/lead.model.js";
import { redisClient } from "../config/redis.js";

const RANKING_KEY = "leads:rankings";
const CACHE_KEY = "leads:leaderboard:top10";

export const getTopLeads = async()=>{
    // 1. Check cache
    const cached = await redisClient.get(CACHE_KEY);
    if(cached){
        return JSON.parse(cached); // converting the strings to JSON objects
    }
    // 2. Get reanked IDs of top 10
    const results = await redisClient.zrevrange(
        RANKING_KEY,
        0,
        9,
        "WITHSCORES"
    ); 
    // results:
        // [
        //     leadId,
        //     score,
        //     leadId,
        //     score
        // ]
    const rankings = [];
    
    for(let i = 0; i<results.length; i+=2){
        rankings.push({
            id: results[i],
            score:Number(results[i+1])
        })
    }
    // 3 Fetching the documents from Mongo DB 
    const leads = await Lead.find({
        _id:{
            $in:rankings.map(item=>item.id)
        }
    }).lean();

    const leadMap = new Map(
        leads.map(lead=>[
            lead._id.toString(),
            lead
        ])
    ); // This is take each lead and create a two element array and put all the array in a big arrray 
    /* 
    [
        ["B", { ...Bob }],
        ["A", { ...Alice }],
        ["C", { ...Charlie }]
    ]
    */
    // 4. Combine Redis+ MongoDB
    const leaderboard = rankings.map(item=>{
        const lead = leadMap.get(item.id)
        if (!lead) return null;
        return{
            id:item.id,
            name:lead.name,
            company:lead.company,
            score:item.score,
            status:lead.status
        }
    })
    //remove the nulls
    .filter(Boolean)
    // assigning the ranks
    .map((lead,index)=>({
        rank:index+1,
        ...lead
    }));

    // 5 . Cahe from 30 seconds
    await redisClient.set(
        CACHE_KEY,
        JSON.stringify(leaderboard),
        "EX",
        30
    );
    return leaderboard;

}

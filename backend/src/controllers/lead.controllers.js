import Lead from "../models/lead.model.js";
import { redisClient } from "../config/redis.js";


// create 
export const createLead = async(req,res)=>{
    try{
        const {name,email,company,score,status} = req.body;
        const lead = await Lead.create({
            name,
            email,
            company,
            score,
            status
        });

        // Adding the data to redis 
        await redisClient.zAdd("leads:ranking",{
            score:lead.score,
            value: lead._id.toString()
        });
        // The above means put this into leads:ranking and Sort set with 
        // its score

        res.status(201).json({
            success:true,
            lead
        });

    }catch(error){
        console.log(error)
        res.status(500).json({
            success:'false',
            message:`Failed to create Lead`})
    }
}

// get 

export const getleaderBoard = async(req,res)=>{
    try{
        const results = await redisClient.zRangeWithScores(
            "leads:ranking",
            0,
            9,
            {
                REV:true // give in descending order
            }
        );
        const leaderBoard = [];

        // the above return a array of objects {score, value}
        for(const{value:leadId,score} of results){
            const lead = await Lead.findById(leadId).lean();
            //You're just reading the lead, so you don't need Mongoose's document features.
            //It can also be faster and use less memory, especially when retrieving many documents.

            if(!lead) continue;

            leaderBoard.push({
                rank:leaderBoard.length+1,
                id: leadId,
                name:lead.name,
                company:lead.company,
                status:lead.status,
                score
            });

        }
        res.json({
            success: true,
            leaderBoard
        });

        
    }catch(error){
        console.log(error)
        res.status(500).json({

            success:false,
            message:"Failed to fetch leadBoard",
        })

    }
}
// update 

export const updateLeadScore = async(req,res)=>{
    try{
        const {id} = req.params;
        const {score} = req.body;

    }catch(error)
}
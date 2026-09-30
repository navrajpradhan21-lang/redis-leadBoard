import Lead from "../models/lead.model.js";
import { redisClient } from "../config/redis.js";


// create 
export const createLead = async(req,res)=>{
    try{
        const {name,email,company,score,status} = req.body;
        // create lead in MongoDB

        const lead = await Lead.create({
            name,
            email,
            company,
            score,
            status
        });

        // Adding the data to redis Sorted Set
        await redisClient.zadd(
            "leads:rankings",
            lead.score,
            lead._id.toString()
        );
        // The above means put this into leads:ranking and Sort set with 
        // its score

        // Publish event
        await redisClient.publish(
            "lead:created",
            JSON.stringify({
                leadId:lead._id.toString(),
                name:lead.name,
                score:lead.score
            })
        )

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

// ==========================================
// GET LEADERBOARD
// ==========================================

export const getleaderBoard = async(req,res)=>{
    try{
        // Get the Top 10 lead IDs + scores form Redis 
        const results = await redisClient.zrevrange(
            "leads:ranking",
            0,
            9,
            "WITHSCORES"
        )

        const leaderBoard = [];

        // results:
        // [
        //     leadId,
        //     score,
        //     leadId,
        //     score
        // ]

        for(let i = 0; i<results.length; i+=2){
            const leadId = results[i];
            const score = Number(results[i+1]) 

            // Get complete lead from MongoDB 
            const lead = await Lead
            .findById(leadId)
            .lean();

            if(!lead){
                continue
            };

            leaderBoard.push({
                rank:leaderBoard.length+1, // +1 couz stating may zero hota 
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
        console.log(error);

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

        // validate Score
        if(score === undefined || score<=0 || score >100){
            return res.status(400).json({
                success:false,
                message:"Score must be between 0 to 100"
            })
        } 
        const lead = await Lead.findByIdAndUpdate(
            id,
            {score},
            {
                new:true,
                runValidators:true

            }
        );
        
        if(!lead){
            return res.status(404).json({
                success:false,
                message:"Lead not found"
            });
        }
        
        // Update Redis Sorted set 
        await redisClient.zadd(
            "leads:ranking",
            score,
            id
        );

        // Publish update Event
        await redisClient.publish(
            "lead:updated",
            JSON.stringify({
                leadId:id,
                score:score
            })
        );

        res.status(200).json({
            success:true,
            lead
        })
        
    }catch(error){
        console.error("Update LeadScore Error",error);

        res.status(500).json({
            success: false,
            message: "Failed to update score"
        });
    }
};


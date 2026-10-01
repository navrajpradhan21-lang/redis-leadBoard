import Lead from "../models/lead.model.js";
import { redisClient } from "../config/redis.js";
import { getTopLeads } from "../services/leaderboard.service.js";

// create 
export const createLead = async (req, res) => {
    try {
        const { name, email, company, score, status } = req.body;
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
        
        // delete the cached data
        await redisClient.del("leads:leaderboard:top10")


        // The above means put this into leads:ranking and Sort set with 
        // its score
        // Publish event
        await redisClient.publish(
            "lead:created",
            JSON.stringify({
                leadId: lead._id.toString(),
                name: lead.name,
                score: lead.score
            })
        )
        res.status(201).json({
            success: true,
            lead
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: 'false',
            message: `Failed to create Lead`
        })
    }
}

// ==========================================
// GET LEADERBOARD
// ==========================================

export const getleaderBoard = async (req, res) => {
    try {
        const leaderboard = await getTopLeads();

        return res.status(200).json({
            success: true,
            leaderboard
        });


    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch leadBoard",
        })

    }
}

// ==========================================
// UPDATE
// ==========================================


export const updateLeadScore = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body;

        // validate Score
        if (score === undefined || score <= 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: "Score must be between 0 to 100"
            })
        }
        const lead = await Lead.findByIdAndUpdate(
            id,
            { score },
            {
                new: true,
                runValidators: true

            }
        );

        if(!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        // Update Redis Sorted set 
        await redisClient.zadd(
            "leads:rankings",
            score,
            id
        );

        // delete the cached data
        await redisClient.del("leads:leaderboard:top10")

        // Publish updated Event
        await redisClient.publish(
            "lead:updated",
            JSON.stringify({
                leadId: id,
                score: score
            })
        );

        res.status(200).json({
            success: true,
            lead
        })

    } catch (error) {
        console.error("Update LeadScore Error", error);

        res.status(500).json({
            success: false,
            message: "Failed to update score"
        });
    }
};


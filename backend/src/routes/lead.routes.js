import express from "express";

import { createLead, getleaderBoard, updateLeadScore } from "../controllers/lead.controllers.js";


const leadrouter = express.Router();


leadrouter.post("/",createLead);
leadrouter.get("/leaderboard",getleaderBoard)
leadrouter.patch('/:id/score',updateLeadScore)

export default leadrouter;

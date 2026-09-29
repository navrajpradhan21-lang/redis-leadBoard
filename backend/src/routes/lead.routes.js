import express from "express";

import { createLead, getleaderBoard } from "../controllers/lead.controllers.js";


const leadrouter = express.Router();


leadrouter.post("/",createLead);
leadrouter.get("/leaderboard",getleaderBoard)

export default leadrouter;

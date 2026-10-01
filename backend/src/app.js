import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import leadrouter from "./routes/lead.routes.js";

dotenv.config() // loading the env variables

const app = express()


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"))

app.get('/',async(req,res)=>{
    return res.status(200).json({message:"Heath check"})
});


app.use("/api/leads",leadrouter)

export default app;

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import {connectRedis} from "./config/redis.js";

import Server from "socket.io";

const PORT = process.env.PORT || 5000;


// Creating Http server manually and connect it to express server

const httpServer = http.createServer(app);


// Creating a Socket Io server and attached it to my http server
const io = new Server(httpServer,{
    cors:{
        origin:""
    }
});

io.on("connection",(socket)=>{
    console.log("Client connected",socket.id);

    socket.on("disconnect",()=>{
        console.log('Client Disconnected',socket.id)
    })
})

// the above is Whenever a client connects, give me its socket object. When that client disconnects, tell me.

const startServer = async()=>{

    await connectDB();

    await connectRedis();

    httpServer.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();


import dotenv from "dotenv";
dotenv.config();

import http from "http";
import {Server} from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import {redisSubscriber} from "./config/redis.js";



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

   await redisSubscriber.subscribe("lead:updated");
   
   redisSubscriber.on("message",(channel, message)=>{
    if(channel == "lead:updated"){
        const data = JSON.parse(message);
        console.log("Lead updated:",data)
        io.emit('lead:updated',data)
    }

   });

    httpServer.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();


import mongoose from "mongoose";


const LeadSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    company:{
        type:String,
        required:true,
        trim:true
    },
    score:{
        type:Number,
        default:0,
        min:0,
        max:100
    },
    status:{
        type:String,
        enum:["cold","warm","hot"],
        default:"cold"
    }

},{timestamps:true})

const Lead = mongoose.model("Lead",LeadSchema);
export default Lead;

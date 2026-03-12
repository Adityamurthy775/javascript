import exp from'express'
import { connect } from 'mongoose'
import { userapp } from './APIs/userAPIs.js'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
config();//to access the .env variables
let app=exp()
let port =process.env.PORT||4000 //set a port number

app.use(exp.json())
//add ccokie parser middleware
app.use(cookieParser())
//forwarsd the request to user if path starts with /user-apo
app.use("/user-api",userapp)
//connect to db server
async function connectDB() {
    try{
        await connect(process.env.DB_URL)
        console.log("connection is sucessful")
        app.listen(port,()=> console.log("server is active...")) //assign the port number to the HTTP request
    }catch(err){
        console.log("err in the database",err)
    }
}
connectDB()

//error handling middleware
app.use((err,req,res,next)=>{
    if(err.name==='ValidationError'){
        return res.status(400).json({message:"errror occured",error:err.message})
    }
    if(err.name==='CastError'){
        return res.status(400).json({message:"errror occured",error:err.message})
    }

    //server side error
    res.status(500).json({message:"error occured",error:err.name})
})

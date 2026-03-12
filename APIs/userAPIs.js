//create a mini express application
import exp from 'express'
export let userapp=exp.Router()
import { usermodel } from '../models/userModel.js'
import { hash,compare } from 'bcryptjs'
import { productmodel } from '../models/productModel.js'
import jwt from 'jsonwebtoken'
import { verfiytoken } from '../middlewares/verfiytoken.js' 
let {sign}=jwt
import { config } from 'dotenv'
config()
//define user rest api routes

//user login
userapp.post("/auths",async(req,res)=>{
    let {email,password}=req.body
    //verfiy the email
    let user=await usermodel.findOne({email:email})
    if(!user){
       return  res.status(400).json({message:"Invalid email"})
    }
    //compare the password
    let result=await compare(password,user.password)
    if(!result){
       return res.status(400).json({message:"Invalid password"})
    }
    //if password is matched
    //generate the token(jsonwebtoken-jwt)
    let signtoken=sign({email:user.email},process.env.SECRET_KEY,{expiresIn:"1h"})
    //store the token as http only cookie
    res.cookie("token",signtoken,{
        httpOnly:true,
        sameSite:"lax",
        secure:false
    })
    res.status(200).json({message:"login succes",payload:user })

})

userapp.post("/users",verfiytoken,async(req,res)=>{
    //get new user obj 
    let data=req.body
    //hash the password
    let hashpassword=await hash(data.password,12)
    //replace the password with hashpassword
    data.password=hashpassword
    //create new user documnet
    let newuserdoc=new usermodel(data)
    //save it
    let result=await newuserdoc.save()
    //console.log(result)
    //send response
    res.status(201).json({message:"user is created"})

})
//read all  the users
userapp.get("/users",verfiytoken,async(req,res)=>{
    //real all the users from db
    let userslist=await usermodel.find()
    res.status(201).json({message:"all the users list",payload:userslist})
})
//read a user by objid
userapp.get("/user",verfiytoken,async(req,res)=>{
    //read user emaill from req
    const emailofuser=req.user?.email
    //find the user by id
    let userobj=await usermodel.findOne({email:emailofuser}).populate("cart.product")
    //use findone method with non obj id fields
    //use find byid to read documents to read obj id
    //if user ot found
    if(userobj===null){
       return res.status(404).json({message:"user not found"})
    }
    res.status(200).json({message:"user",payload:userobj})
})
//update user by id
userapp.put("/users/:id",verfiytoken,async(req,res)=>{
    //get modified user from req
    let modifieddata=req.body//get the data from the req
    let id=req.params.id//get the id from the url parameter
    //get the password and hash
    let hashpassword=await hash(modifieddata.password,12)
    //update the password
    modifieddata.password=hashpassword
    //find the user and update
    let updateddata=await usermodel.findByIdAndUpdate(id,{$set:{...modifieddata}},{new:true,runValidators:true})
    res.status(200).json({message:"user is modified",payload:updateddata})
})
userapp.delete("/users/:id",verfiytoken,async(req,res)=>{
    //get the id from parameter
    let id=req.params.id
    //find and delete the data
    let deleteduser=await usermodel.findByIdAndDelete(id)
    if(deleteduser===null){
        return res.status(404).json({message:"user not found"})
    }
    res.status(200).json({message:"user is deleted",payload:deleteduser})
})
// add the product to cart
userapp.put("/cart/product-id/:pid",verfiytoken,async(req,res)=>{
    let productid=req.params.pid
    //get the current user data
    const emailofuser=req.user?.email
    //get the user from db

    //add product to cart
  let result=  await usermodel.findOneAndUpdate({email:emailofuser},{$push:{cart:{product:productid}}}).populate("cart.product")
if(!result){
        return res.status(404).json({message:"User not found"})
    }
  res.status(200).json({message:"added to cart"})
})
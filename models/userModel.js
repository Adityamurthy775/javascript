// create user schema
 import { Schema,model} from "mongoose";
 
 // create the cart schema{product,count}
 const cartschema=new Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:"product",
    },
    count:{
        type:Number,
        default:1
    }
 })
let userschema=new Schema({
    username:{
        type:String,
        required:[true," username is requried"]
    },
    password:{
        type:String,
        required:[true,"Passwoard is requried"]
    },
    email:{
        type:String,
        required:[true,"email is requried"],
        unique:[true,"email already existed"]
    },
    age:{
        type:Number
    },
    cart:[cartschema]
},{
    versionKey:false,
    timestamps:true
})
//generate usermodel
export let usermodel=model("user",userschema)


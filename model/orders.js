import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
    userId:{type:String,required:true},
    products:[{type:mongoose.Schema.Types.ObjectId,ref:"product"}],
    address:{type:String,required:true},
    amount:{type:Number,required:true},
    quantity:{type:Number,required:true},

})

const Order=mongoose.model("order",orderSchema);
export default Order


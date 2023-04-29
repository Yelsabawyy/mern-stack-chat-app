const mongoose =require('mongoose');

const messageModel= mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content:{ //message
        type: String,
        trim: true,
    },
    chat:{ // belong to any chat
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    }
},{
    timestamps:true
});

const message=mongoose.model("Message",messageModel);
module.exports=message;
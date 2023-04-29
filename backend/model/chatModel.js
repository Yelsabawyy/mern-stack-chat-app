const mongoose=require('mongoose');

const chatModel = mongoose.Schema({
    chatName:{ // used if isGroupChat
        type: String,
        trim: true,
    },
    latestMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    isGroupChat:{
        type: Boolean,
        default: false,
    },

    //between 
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    groupAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

},{
    timestamps:true
}
);

const Chat =mongoose.model("Chat",chatModel);
module.exports =Chat;
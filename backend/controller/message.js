const Message = require("../model/messageModel");
const User = require("../model/userModel");
const Chat = require("../model/chatModel");

//description get all messages in the chat
// method post
//route /message/allMessages/:chatId
exports.allMessages =(req, res) => {
    Message.find({ chat: req.body.chatId })
      .populate("sender", "firstName lastName picture email")
      .populate("chat")
      .then(messages=>{
        res.json(messages);
      }).catch(err=>{
        res.status(400).json({error:err.message});
      })
  
};

//description send message
// method post
//route /message/sendMessage
exports.sendMessage = (req, res)  => {
  const  content = req.body.content;
  const  chatId = req.body.chatId;

  if (!content || !chatId) {
    res.status(400).json({error:"invalid data passed"});
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

 
    Message.create(newMessage).then(message=>{

      message.populate("sender", "firstName lastName picture email").then(message=>{

        message.populate("chat").then(message=>{
          User.populate(message, {
            path: "chat.users",
            select: "firstName lastName picture email",
          }).then(message=>{
            console.log("message");
            console.log(message);
            Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message }).then(data=>{
              res.json(message);
            })
            
          });
        }).catch(err=>{
          res.status(400).json({error:err.message});
        })
      })
    }).catch(err=>{
      res.status(400).json({error:err.message});
    });
    
    


};



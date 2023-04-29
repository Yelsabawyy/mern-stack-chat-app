const Chat=require("../model/chatModel.js");
const User=require("../model/userModel.js");


//post request
// route /chat/
//des : get or create chat between 2 users (not group chat)
exports.accessChat =  (req, res, next) => {
    const userId = req.body.userId; // friend i will chat with id

    if (!userId) {
      res.status(400).json({error:"No friend Id found"});   
    }
  
    
    Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } }, // myId (req.user is send from auth middleware)
        { users: { $elemMatch: { $eq: userId } } }, // friendId
      ],
    })
      .populate("users", "-password") //return actual data of users
      .populate("latestMessage") //return actual last message
      .populate("latestMessage.sender", "-password") 
      .then(chat=>{

        if (chat.length > 0) {
          res.send(chat[0]);
        } else { // no chat between users
          var chatData = {
            isGroupChat: false,
            users: [req.user._id, userId],
          };

          Chat.create(chatData).then(createdChat=>{
              Chat.findOne({ _id: createdChat._id }).populate(
                  "users",
                  "-password"
                  ).then(fullChat=>{
                      res.status(200).json(fullChat);
                  });
          }).catch(err=>{
              res.status(400).json({error:"chat Error"});  
          })

        }

        // User.populate(chat, {
        //     path: "latestMessage.sender",
        //     select: "firstName lastName picture email",
        //   }).then (isChat=>{

        //     if (isChat.length > 0) {
        //         res.send(isChat[0]);
        //       } else { // no chat between users
        //         var chatData = {
        //           isGroupChat: false,
        //           users: [req.user._id, userId],
        //         };

        //         Chat.create(chatData).then(createdChat=>{
        //             Chat.findOne({ _id: createdChat._id }).populate(
        //                 "users",
        //                 "-password"
        //                 ).then(fullChat=>{
        //                     res.status(200).json(fullChat);
        //                 });
        //         }).catch(err=>{
        //             res.status(400).json({error:"chat Error"});  
        //         })

        //       }
        //   })
      }).catch(err=>{
        res.status(400).json({error:"chat Error"});  
      })
  
    

};


//get request
// route /chat/
//des : fetch all chats of current user
exports.fetchAllChats =  (req, res, next) => {

Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .populate("latestMessage.sender", "-password")
    .sort({ updatedAt: -1 })
    .then((results) => {
        User.populate(results, {
            path: "latestMessage.sender",
            select: "firstName lastName picture email",
        }).then(results=>{
          res.status(200).send(results);
        })
    }).catch(err=>{
    res.status(400).json({error:"Error!!"});
    })
};


//post request
//route /chat/create-group
//des : create group
exports.createGroup = (req, res,next) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ error: "Please Fill all the feilds" });
    }
  
    var groupUsers = JSON.parse(req.body.users);
  
    if (groupUsers.length < 2) {
      return res
        .status(400)
        .send({error:"More than 2 users are required to form a group chat"});
    }
  
    groupUsers.push(req.user);
  

       Chat.create({
        chatName: req.body.name,
        users: groupUsers,
        isGroupChat: true,
        groupAdmin: req.user,
      }).then (groupChat=>{
         Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password").then(fullGroupChat=>{
            res.status(200).json(fullGroupChat);
        })
      }).catch(err=>{
        res.status(400)
        .send({error:"Error occured!!"});
      })
  

  };

//post request
//route /chat/rename-group
//des : rename group 
exports.renameGroup = (req, res,next) => { 
const chatId = req.body.chatId;
const chatName = req.body.chatName;

  Chat.findByIdAndUpdate( chatId,{chatName: chatName,},{ new: true,})
  .populate("users", "-password")
  .populate("groupAdmin", "-password").then(updatedChat=>{
    if (!updatedChat) {
        res.status(400)
        .send({error:"chat not found"});
      } else {
        res.json(updatedChat);
      }
  }).catch(err=>{
    res.status(400)
    .send({error:"Error occured!!"});
  })

  };

//put request
//route /chat/add-group
//des : add user to group 
exports.addToGroup = (req, res,next) => { 
const chatId = req.body.chatId;
const userId = req.body.userId; //new user

Chat.findByIdAndUpdate(
  chatId,
  {
    $push: { users: userId },
  },
  {
    new: true,
  }
)
  .populate("users", "-password")
  .populate("groupAdmin", "-password").then(added=>{
    if (!added) {
        res.status(400)
    .send({error:"chat not found"});
      } else {
        res.json(added);
      }
  }).catch(err=>{
    res.status(400)
    .send({error:"Error Occured!!"});
  });
  };

//put request
//route /chat/remove-group
//des : remove user from group 
exports.removeFromGroup = (req, res,next) => { 
const chatId = req.body.chatId;
const userId = req.body.userId; // user removed


// check if the requester is admin

Chat.findByIdAndUpdate(
  chatId,
  {
    $pull: { users: userId },
  },
  {
    new: true,
  }
)
  .populate("users", "-password")
  .populate("groupAdmin", "-password").then(removed=>{
    if (!removed) {
        res.status(400)
    .send({error:"chat not found"});
      } else {
        res.json(removed);
      }
  }).catch(err=>{
    res.status(400)
    .send({error:"Error occured!!"});
  });
  };
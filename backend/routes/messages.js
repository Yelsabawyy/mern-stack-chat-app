const express =require('express');
const router=express.Router();

const auth=require("../middleware/auth.js");

const messagesController=require('../controller/message.js');

router.post('/allMessages',auth,messagesController.allMessages); 
router.post('/sendMessage',auth,messagesController.sendMessage); 

module.exports=router;
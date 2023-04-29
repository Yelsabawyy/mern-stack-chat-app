const express =require('express');
const router=express.Router();

const auth=require("../middleware/auth.js");

const chatController=require('../controller/chat.js');

router.get('/',auth,chatController.fetchAllChats); // fetch chats in the left of the screen 

router.post('/',auth,chatController.accessChat); // create chat or access chat of current user

router.post('/create-group',auth,chatController.createGroup); // create group
router.post('/rename-group',auth,chatController.renameGroup); // rename group
router.put('/add-group',auth,chatController.addToGroup); // add someone group
router.put('/remove-group',auth,chatController.removeFromGroup); // remove group

module.exports=router;
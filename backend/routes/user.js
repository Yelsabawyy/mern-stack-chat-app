const express =require('express');
const router=express.Router();

const auth=require("../middleware/auth.js");

const userController=require('../controller/user.js');

router.post('/register',userController.userRegister); // register
router.post('/login',userController.userLogin); // login

router.get('/search',auth,userController.searchUser); // search user to search

module.exports=router;
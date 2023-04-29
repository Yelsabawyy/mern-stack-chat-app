const jwt =require('jsonwebtoken');
const express = require('express');
const User = require('../model/userModel.js');


const auth = async(req, res, next) => {
  // when login or register token is created using jwt and send to frontend expires in 30 days
  // any request from frontend should send token through header so get id from token so know which user send this message;  
  let token; 

    if ( req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) { // i send "Bearer " from front end
      try {
        const jwtSecret="youssefElsabawy!__";
          token = req.headers.authorization.split(" ")[1]; // ana fl frontend bb3at "Bearer " feha space 3alshan a3rf a3ml split using space
          const decoded = jwt.verify(token,jwtSecret);

          //req.user send to any function controller (auth middleware) is used before
          // i can control user logged in by req.user
          req.user = await User.findById(decoded.id).select("-password");
          
          next();
      } catch (error) {
        res.status(400).json({error:"token Failed!!"}); 
      }
    }
  
    if (!token) {
        res.status(400).json({error:"No token!!"});
    }
};
module.exports=auth;
const User = require('../model/userModel.js');

const jwt =require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const mongoose=require('mongoose');

// fun used in login and register to create token using id and send to frontend and stored in localstorage
function generateToken(id){
    const jwtSecret="youssefElsabawy!__";
    return jwt.sign({id},jwtSecret,{
        expiresIn :"30d"
    })
};

// post request
// route: /register 
exports.userRegister = (req, res, next) => {

    const firstName=req.body.firstName;
    const lastName=req.body.lastName;
    const email=req.body.email;
    const picture=req.body.picture;
    const password=req.body.password;
    // const confirmPassword=req.body.confirmPassword; // not used since i check password == confirm password from front end

    User.findOne({ email: email})
    .then(user => {
        if(user){ // means email is used before so cant create account with same email
          res.status(400).json({error:"This Email is used before!!"});     
        }else{ // no user with this email
            bcrypt.hash(password, saltRounds, function(err, hash) {
                    const user = new User({
                        firstName: firstName,
                        lastName:lastName,
                        email:email,
                        picture:picture,
                        password:hash,
                    });
                    user.save().then(result=>{
                        res.status(201).json({
                          _id: user._id,
                            firstName: result.firstName,
                            lastName:result.lastName,
                            email:result.email,
                            picture:result.picture,
                            token:generateToken(result._id)
                        });
                    }).catch(err=>{
                      console.log(err);
                      res.status(400).json({error:"Error!! please Try Again Later"});   
                    });
            });
        }
    })
    .catch(err => {
      console.log(err);
    });
  
    
};

// post request
// route: /login
exports.userLogin = (req, res, next) => {

    const email=req.body.email;
    const password=req.body.password;

    User.findOne({ email: email})
    .then(user => {
        if(!user){ // No User with this email
          res.status(400).json({error:"Incorrect Email or password!!"});
        }else{ // email exist so next step is to check password
            const userPassword =user.password; 
            bcrypt.compare(password, userPassword).then(function(result) {
                if(result==false){
                    res.status(400).json({error:"Incorrect Password!!"});
                }else{
                    res.status(201).json({
                        _id: user._id,
                        firstName: user.firstName,
                        lastName:user.lastName,
                        email:user.email,
                        picture:user.picture,
                        token:generateToken(user._id)
                    });
                    
                }
            });
        }
    })
    .catch(err => {
      console.log(err);
    });
  
    
};

// get request
// route: /search
// des: used to search for a users by name or email to start chat with
// used in frontend in (SideDrawer) 
exports.searchUser =(req,res,next)=>{

    User.aggregate([
        {
          $addFields: {
            fullName: { $concat: [ "$firstName", " ", "$lastName" ] }
          }
        },
        {
          $match: {
            $and: [
                {
                  $or: [
                    { fullName: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } }
                  ]
                },
                {
                  _id: {
                    $ne: req.user._id
                  }
                }
              ]
          }
        }
      ])
     
      .then((results) => {
          console.log(results);
          res.send(results);
      })
      .catch((err) => {
        // handle error
        console.log(err);
      });
    
}
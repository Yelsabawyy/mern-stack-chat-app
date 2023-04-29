const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path =require('path');
var bodyParser = require('body-parser');

const userRouter = require('./routes/user.js');
const chatRouter = require('./routes/chat.js');
const messageRouter = require('./routes/messages.js');

const notFound =require('./middleware/notFound.js');
const errorHandler =require('./middleware/errorHandler.js');
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/',userRouter);
app.use('/chat',chatRouter);
app.use('/messages',messageRouter);


app.use(notFound);
// app.use(errorHandler);

dotenv.config();

const MONGODB_URI = 'mongodb+srv://chattalk1999:mongodb1999@cluster0.tvcebao.mongodb.net/test';

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(result => {

    const PORT = process.env.PORT || 5000;

    const server= app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });





// socket

const io = require("socket.io")(server, {
  pingTimeout: 600000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {

  console.log("Connected to socket.io");
  // on means recive
  // emit means send
  // when user open website he create his own socket
  // create room to particular user only
  // so we can use socket.in(userId)

  socket.on("setup", (userData) => {
    console.log("userData");
    console.log("userData");
    console.log(userData);

    socket.join(userData._id);
    socket.emit("connected");  
  });

  //create room between chat 
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    
    var chat = newMessageRecieved.chat;
    

    if (!chat.users) return console.log("chat.users not defined");
    
    chat.users.forEach((user) => {
      // not send message to me again
      if (user._id == newMessageRecieved.sender._id) return;

      //send to specific user (user._id)
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

// end socket



  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });



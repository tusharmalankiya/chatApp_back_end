const app = require("./app");
require("dotenv").config();
const jwt = require("jsonwebtoken");

//imports
const ChatRoom = require("./models/ChatRoom");
const User = require("./models/User");
const Message = require("./models/Message");
const Chat = require("./models/Chat");

//web socket server
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

module.exports.httpServer = httpServer;

console.log("server");
//------------socket middleware---------------------------------------------------------------------
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("No Token");
    return next(new Error("Authentication Error: No token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.id; //userID
    socket.username = decoded.username; //username
    next();
  } catch (err) {
    console.log(err.message);
    return next(new Error("Authentication error: Invalid token"));
  }
});

//------------------------socket connection logic------------------------
io.on("connection", async (socket) => {
  console.log("connection established ", socket.id, socket.username);
  //saving socketid of user
  try {
    await User.findByIdAndUpdate(
      socket.userId,
      { socket: socket.id, online: true },
      { new: true }
    );
    //broadcasting online status of newly connected client
    socket.broadcast.emit("status", {
      receiverId: socket.userId,
      status: true,
    });
  } catch (err) {
    console.log(err);
  }

  //sending all current chats to client's home page
  socket.on("sendChats", async () => {
    try {
      const users = await User.find({ username: { $nin: [socket.username] } });
      // const chatrooms = await ChatRoom.find({});
      // const all_chats = [...users, ...chatrooms];
      socket.emit("currentChats", users);
    } catch (err) {
      console.log(err);
    }
  });
  //------------Group Chat-------------------------------
  //JOIN ROOM (Initializing the group chat)
  socket.on("joinRoom", async (roomName) => {
    //saving chatroom into database if not created already.
    const chatroom = await ChatRoom.CheckChatRoom(roomName);

    const messages = await Message.find({ chatroom: chatroom._id });
    //emiting messages to this new client
    socket.emit("prevRoomMessages", messages);

    socket.join(roomName);
    console.log(`User ${socket.username} joined room ${roomName}`);
    socket.emit("roomJoined", `You are connected to room "${roomName}"`);
  });

  //GROUP CHAT
  socket.on("roomSender", (message, roomname) => {
    //saving message to database
    console.log(socket.userId);
    User.findById(socket.userId).then((user) => {
      ChatRoom.findOne({ name: roomname }).then((chatroom) => {
        Message.create({
          chatroom: chatroom._id,
          senderId: user._id,
          message,
        }).then((message) => {
          io.to(roomname).emit("toRoom", message);
          // console.log(message);
        });
      });
    });

    console.log(`"${message}" in ${roomname} by ${socket.username} `);
  });
  //------------------------------------------------------------------------------
  //PERSONAL CHAT

  //retriving previous messages
  socket.on("joinChat", async (receiverId) => {
    try {
      //retriving receiver data
      //this line can be commented
      const receiver = await User.findById(receiverId);
      //retriving chat data
      try {
        const oldChatMessages = await Chat.find({
          senderId: { $in: [socket.userId, receiverId] },
          receiverId: { $in: [socket.userId, receiverId] },
          markAsRead: true,
        });
        //sending receiver Information
        socket.emit("receiverInfo", receiver);
        //sending previous old messages
        socket.emit("prevChatMessages", oldChatMessages);

        const newChatMessages = await Chat.find({
          senderId: { $in: [socket.userId, receiverId] },
          receiverId: { $in: [socket.userId, receiverId] },
          markAsRead: false,
        });

        socket.emit("newChatMessages", newChatMessages);

        console.log(`"${socket.username}" joined with "${receiver.username}"`);
        socket.emit(
          "chatJoined",
          `You are connected with ${receiver.username}`
        );
      } catch (err) {
        console.log("error retriving private chat data");
      }
    } catch (err) {
      console.log("error retriving receiver for private chat", err);
    }
  });

  // socket.on("sendUnreadMessages", async (receiverId) => {
  //   //sending new unread messages
  //   const unreadMessages = await Chat.find({
  //     senderId: { $in: [socket.userId, receiverId] },
  //     receiverId: { $in: [socket.userId, receiverId] },
  //     markAsRead: false,
  //   });

  //   await Chat.updateMany(
  //     {
  //       senderId: { $in: [socket.userId, receiverId] },
  //       receiverId: { $in: [socket.userId, receiverId] },
  //       markAsRead: false,
  //     },
  //     { markAsRead: true }
  //   );

  //   //sending new messages
  //   socket.emit("unreadMessages", unreadMessages);
  //   // console.log("unread messages", unreadMessages);
  // });

  //saving messages
  socket.on("chatSender", async (message, receiverId) => {
    console.log("person", socket.id);
    const senderId = socket.userId;
    const user2 = await User.findById(receiverId);

    //saving messages into the database
    try {
      const chat = await Chat.create({ senderId, receiverId, message });
      io.to(user2.socket).emit("toReceiver", chat);
      socket.emit("toSender", chat);
    } catch (err) {
      console.log("error saving personal message");
    }
  });

  //marking as read
  socket.on("markMessageAsRead", async (msg) => {
    // console.log("-------Marking msg as read--------------");
    try {
      const message = await Chat.findByIdAndUpdate(msg._id, {
        markAsRead: true,
      });
      try {
        //sending marking msg flag as read
        const sender = await User.findById(message.senderId);
        io.to(sender.socket).emit("markedAsRead", msg);
        console.log("flag sent");
      } catch (err) {
        console.log("error while getting receiver to mark msg as read");
      }
    } catch {
      console.log("error while marking messages as read");
    }
  });

  //for disconnect
  socket.on("disconnect", async (reason) => {
    //making user offline in database
    await User.findByIdAndUpdate(
      socket.userId,
      { online: false },
      { new: true }
    );

    // socket.emit("userStatus")
    socket.broadcast.emit("status", {
      receiverId: socket.userId,
      status: false,
    });

    console.log(
      `${socket.id}(${socket.username}) disconnected because ${reason}`
    );
  });
});

const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "please enter name of chatroom"],
        unique: true,
        lowercase: true,
        maxLength: [20, "username should not be more than 20 characters"],
      },
    },
    { timestamps: true }
  );

  chatroomSchema.statics.CheckChatRoom = async function(name){
    const chatroom = await this.findOne({name});
    if(!chatroom){
        const chatroom = await this.create({name});
        return chatroom;
    }
    return chatroom;
  }
  
  
const ChatRoom = mongoose.model("Chatroom", chatroomSchema);

module.exports = ChatRoom;
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "please enter name of chatroom"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "sender is required"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "receiver is required"],
    },
    markAsRead:{
      type:Boolean,
      default: false
    }
  },
  { timestamps: true }
);

//   chatSchema.statics.CheckChatRoom = async function(name){
//     const chatroom = await this.findOne({name});
//     if(!chatroom){
//         const chatroom = await this.create({name});
//         return chatroom;
//     }
//     return chatroom;
//   }

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

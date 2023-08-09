const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isStrongPassword } = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "please enter username"],
      unique: true,
      lowercase: true,
      maxLength: [20, "username should not be more than 20 characters"],
    },

    password: {
      type: String,
      required: [true, "please enter a password"],
      minLength: [8, "please enter at least 8 characters"],
      // validate: [isStrongPassword, 'please choose strong password']
    },
    socket: {
      type: String,
      default:null
    },
    online:{
      type : Boolean,
      default:false
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  console.log("into pre save");
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  // console.log(this);
  next();
});

userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
};

const User = mongoose.model("User", userSchema);

module.exports = User;

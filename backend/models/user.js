const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const examResultSchema = new mongoose.Schema({
  subject: String,
  score: Number,
  totalMarks : Number,
  markedAnswers : {type : Map, of : String},
  result : {type : String},
  status : {type : String},
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    email : {
      type : String,
      required : true,
      unique : true, // No duplicate emails
      trim : true, // Removes extra spaces
      validate : [validator.isEmail, 'Invalid Email format'] // Validate email format
    },
    password : {type : String, required : true},
    role : {
      type : String,
      required : true,
      default : "user",
      trim : true
    },
    exams : [examResultSchema]
  }
)

userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
   
  if(this.isModified('password')){
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
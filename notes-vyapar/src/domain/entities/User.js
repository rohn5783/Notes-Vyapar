import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }, 
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],

  } ,
  avatar: {
    type: String,
    default: 'https://ik.imagekit.io/a4uu1ujnt/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  lastResend: Date,
resendCount: {
  type: Number,
  default: 0
},
  verificationTokenExpiry: {
    type: Date,
    default: null,
  }
},{timestamps: true});


  //  password hash before save 
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return;
  }

 this.password = await bcrypt.hash(this.password, 10);
});

//  password compare method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

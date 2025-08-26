import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  mobile: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  status: { type: String, default: "Hey there! I'm using ChatApp" },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
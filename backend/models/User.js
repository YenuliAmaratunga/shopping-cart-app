import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String
    },
    provider: {
      type: String,
      required: true,
      enum: ['Email', 'Google', 'Facebook', 'Passkey', 'Guest', 'Admin'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;

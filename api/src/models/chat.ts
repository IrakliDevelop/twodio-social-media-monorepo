import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  users: {
    type: [String],
    required: true,
    index: true,
  },
  message: String,

  created: { type: Date, default: Date.now, index: true },
});

export const ChatModel = mongoose.model('Chat', schema);

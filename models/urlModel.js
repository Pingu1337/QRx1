import mongoose from 'mongoose';

/**
 * MongoDB Schema for URL shortener
 */
const urlSchema = new mongoose.Schema({
  url: {
    required: true,
    type: String,
  },
  id: {
    required: true,
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: '60m', // Automatically removes itself if the URL has not been claimed within 60 minutes
  },
});

const URL = mongoose.model('URL', urlSchema);

export default URL;

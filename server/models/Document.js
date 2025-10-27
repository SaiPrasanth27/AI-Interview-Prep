const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  embedding: [Number]
});

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['resume', 'job_description'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  chunks: [chunkSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
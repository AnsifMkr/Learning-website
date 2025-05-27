const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'video'], required: true },
  day: { type: Number, required: true },
  skillPath: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  clerkId:      { type: String, unique: true, sparse: true },
  username:     { type: String, unique: true, sparse: true, trim: true },
  email:        { type: String, unique: true, required: true, lowercase: true, trim: true },
  mobile:       { type: String, unique: true, sparse: true },
  password:     { type: String },
  role:         { type: String, enum: ['user','admin'], default: 'user' },
  avatarUrl:    { type: String, default: '' },
  xp:              { type: Number, default: 0 },
  badges:          { type: [String], default: [] },
  completedLessons: { type: [mongoose.Schema.Types.ObjectId], ref: 'Lesson', default: [] },
  completedQuizzes: { type: [mongoose.Schema.Types.ObjectId], ref: 'Quiz', default: [] },
  yearlyActivity:  { type: Map, of: Number, default: new Map() }, // YYYY-MM-DD => count of activities
  longestStreak:   { type: Number, default: 0 },
  currentYearStreak: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

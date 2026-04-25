const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/learning-platform'); // Assume standard mongod logic? Actually we don't know the connection string. Let's not guess.
}

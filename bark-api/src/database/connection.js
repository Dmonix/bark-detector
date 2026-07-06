const mongoose = require('mongoose');

const connect = async (uri) => {
  const connUri = uri || process.env.MONGODB_URI;
  await mongoose.connect(connUri);
  console.log(`MongoDB connected: ${connUri}`);
};

const disconnect = async () => {
  await mongoose.disconnect();
};

module.exports = { connect, disconnect };

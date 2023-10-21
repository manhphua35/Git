const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'courses' }], // Sử dụng ref để chỉ định liên kết đến model Course
  },
  {
    timestamps: true,
    collection: 'Account'
  }
);

module.exports = mongoose.model('Account', AccountSchema);

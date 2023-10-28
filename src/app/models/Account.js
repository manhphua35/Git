const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    name : { type: String, required: true},
    username: { type: String, required: true },
    password: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'courses' }], 
  },
  {
    timestamps: true,
    collection: 'Account'
  }
);

module.exports = mongoose.model('Account', AccountSchema);

const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
mongoose.plugin(slug);
const Schema = mongoose.Schema;

const CourseSchema = new Schema(
  {
    action: { type: String, required: true },
    prices: { type: Number, required: true },
    note: { type: String },
    user: { type: Schema.Types.String, ref: 'Account' }, 
    createdAt: { type: Date, default: Date.now, required: true },
  },
  {
    //timestamps: true,
  }
);

CourseSchema.plugin(mongooseDelete, { overrideMethods: 'all' });

module.exports = mongoose.model('courses', CourseSchema);

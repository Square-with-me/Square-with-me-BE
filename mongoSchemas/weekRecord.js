const mongoose = require("mongoose");

const weekRecordSchema = new mongoose.Schema({
  userId: {
    type: Number,
    allowNull: false,
  },
  category: {
    type: String,
    allowNull: false,
  },
  mon: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  tue: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  wed: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  thur: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  fri: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  sat: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  sun: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = mongoose.model("weekRecords", weekRecordSchema);

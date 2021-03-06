const mongoose = require("mongoose");
const { koreanDate: krToday } = require("../utils/date")

const monthRecordSchema = new mongoose.Schema({
  userId: {
    type: Number,
    allowNull: false,
  },
  date: {
    type: Number,
    allowNull: false,
  },
  time: {
    type: Number,
    allowNull: false,
    defaultValue: 0,
  },
  lastUpdatedDate: {
    type: Date,
    allowNull: false,
    default: krToday,
  },
});

module.exports = mongoose.model("monthRecords", monthRecordSchema);

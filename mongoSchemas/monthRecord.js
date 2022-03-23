const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("monthRecords", monthRecordSchema);
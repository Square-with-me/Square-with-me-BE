const mongoose = require("mongoose");
const { koreanDate: krToday } = require("../utils/date")

const userLogSchema = new mongoose.Schema({
  userId: {
    type: Number,
    allowNull: false,
  },
  entryTime: {
    type: Date,
    allowNull: false,
    default: krToday,
  },
  exitTime: {
    type: Date,
    default: null,
  },
  roomId: {
    type: Number,
    allowNull: false,
  },
  category: {
    type: Number,
    allowNull: false,
  },
  roomName: {
    type: String,
    allowNull: false,
  },
});

module.exports = mongoose.model("userLog", userLogSchema);

// 유저, 입장시간, 퇴장시간, 방번호, 카테고리, 방제목
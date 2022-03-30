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

//// 원래 코드
// module.exports = (sequelize, DataTypes) => {
//   const MonthRecord = sequelize.define(
//     'monthRecord',
//     {
//       date: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       time: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//       }
//     },
//     {
//       charset: 'utf8',
//       collate: 'utf8_general_ci',
//     },
//   );

//   MonthRecord.associate = (db) => {
//     db.MonthRecord.belongsTo(db.User);
//   };

//   return MonthRecord;
// };

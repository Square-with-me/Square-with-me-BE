// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge } = require("../models");

// Mongo DB 시간기록
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

module.exports = {
  create: {},

  update: {
    profileImg: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { profileImg } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        profileImg,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          profileImg: profileImg,
        },
      });
    }),

    nickname: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { nickname } = req.body;

      if (nickname.length < 2 || nickname.length > 8) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임은 2글자 ~ 8글자로 적어주세요.",
        });
      }

      if (!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다.",
        });
      }

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        nickname,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          nickname,
        },
      });
    }),

    statusMsg: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { statusMsg } = req.body;

      if (statusMsg.length < 1 || statusMsg.length > 20) {
        return res.status(400).json({
          isSuccess: false,
          msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요.",
        });
      }

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        statusMsg,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          statusMsg,
        },
      });
    }),

    masterBadge: asyncWrapper(async (req, res) => {
      const { id: userId } = res.locals.user;
      const { badgeId } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        masterBadgeId: badgeId,
      });
      const myMasterBadge = await Badge.findOne({
        where: { id: badgeId },
      });
      const imageUrl = await myMasterBadge.imageUrl;

      return res.status(200).json({
        isSuccess: true,
        data: imageUrl,
      });
    }),
  },

  get: {
    user: asyncWrapper(async (req, res) => {
      const { user } = res.locals;

      return res.status(200).json({
        isSuccess: true,
        data: {
          user,
        },
      });
    }),

    // 보유한 뱃지 정보 가져오기
    badges: asyncWrapper(async (req, res) => {
      const { user } = res.locals;

      const badges = await user.getMyBadges({
        attributes: ["id", "name", "imageUrl"],
      });

      return res.status(200).json({
        isSuccess: true,
        data: badges,
      });
    }),

    records: asyncWrapper(async (req, res) => {
      const { id } = res.locals.user;

      // 네모와 함께한 시간 주간, 월간 기록 가져오기

      let weekdaysRecord = await WeekRecord.find(
        { userId: id },
        { _id: 0, __v: 0 }
      );
      console.log("주간 기록을 가져온다", weekdaysRecord);
      // console.log(weekdaysRecord === [])
      // console.log(weekdaysRecord) // result: []
      // date is for the date when the person came into the room.
      if (weekdaysRecord.length === 0) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      }


      ////////////////////// last updated column
      //define a date object variable that will take the current system date
      let lastUpdatedDate = weekdaysRecord[0].lastUpdated

      //find the year of the current date
      let oneJan = new Date(lastUpdatedDate.getFullYear(), 0, 1);

      // calculating number of days in given year before a given date
      let numberOfDays = Math.floor(
        (lastUpdatedDate - oneJan) / (24 * 60 * 60 * 1000)
      );

      console.log(numberOfDays, "numberOfDays");

      // adding 1 since to current date and returns value starting from 0
      let result = Math.ceil((lastUpdatedDate.getDay() + 1 + numberOfDays) / 7);
      console.log(result);
      //display the calculated result
      console.log(
        "Week Numbers of current date (" + lastUpdatedDate + ") is:" + result
      );

      ////////////////this time
      let checkingDate = new Date();

      //find the year of the current date
      let oneJan2 = new Date(checkingDate.getFullYear(), 0, 1);

      // calculating number of days in given year before a given date
      let numberOfDays2 = Math.floor(
        (checkingDate - oneJan2) / (24 * 60 * 60 * 1000)
      );

      // adding 1 since to current date and returns value starting from 0
      let result2 = Math.ceil((checkingDate.getDay() + 1 + numberOfDays2) / 7);
      console.log(result2);
      //display the calculated result
      console.log(
        "Week Numbers of current date (" + checkingDate + ") is:" + result2
      );

      if (
        result !== result2 ||
        lastUpdatedDate.getFullYear() !== checkingDate.getFullYear()
      ) {

        const dateForLastUpdated = await new Date(
          checkingDate.getFullYear(),
          checkingDate.getMonth() + 1,
          checkingDate.getDate()
        );        

        await WeekRecord.updateMany({
          userId: id,
        } ,{ $set: { mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun :0, lastUpdated: dateForLastUpdated } })
        // update to 0
        // how could I get the data from this Monday?
        // we should get all categories' time record which starts from Monday.
        // I have to check time and update at 1) leaving room 2) checking the time graph
        weekdaysRecord = await WeekRecord.find(
          { userId: id },
          { _id: 0, __v: 0 }
        );
      }
      
      // need to check the month is different
      const monthRecord = await MonthRecord.find(
        { userId: id },
        { _id: 0, __v: 0 }
      );

      return res.status(200).json({
        isSuccess: true,
        data: {
          weekdaysRecord,
          monthRecord,
        },
      });
    }),
  },

  delete: {},
};

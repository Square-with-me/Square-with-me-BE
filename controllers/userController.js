// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge } = require("../models");

// Mongo DB 시간기록
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

// RoomController for newBadge
const RoomController = require("./roomController");

// for local time

// 1. 현재 PC 표준 시간
const curr = new Date();

// 2. UTC 시간 계산
const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;

// 3. UTC to KST (UTC + 9시간)
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
const kr_curr = new Date(utc + KR_TIME_DIFF);

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
      // const {newBadge} = RoomController.delete.participant
      const newBadge = await RoomController.delete.newBadge();

      console.log(newBadge, "newBadge");

      if (newBadge !== 0) {
        res.status(200).json({
          isSuccess: true,
          data: badges,
          newBadge: newBadge,
        });

        await RoomController.delete.newBadgeInit();
      } else {
        res.status(200).json({
          isSuccess: true,
          data: badges,
        });
      }
    }),

    records: asyncWrapper(async (req, res) => {
      const { id } = res.locals.user;

      // 네모와 함께한 시간 주간, 월간 기록 가져오기

      //////////////////// <주간 기록>

      let weekdaysRecord = await WeekRecord.find(
        { userId: id },
        { _id: 0, __v: 0 }
      );
      console.log("주간 기록을 가져온다", weekdaysRecord);
      // console.log(weekdaysRecord === [])
      // console.log(weekdaysRecord) // result: []
      // date 는 사용자가 방에 들어온 시점을 가리킴
      if (weekdaysRecord.length === 0) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      }

      const thatUser = await User.findOne({
        where: {
          id,
        },
      });

      const lastUpdatedDate = thatUser.lastUpdated; // 여기에 마지막 업데이트 된 날짜 넣어야함
      const checkingDate = kr_curr;

      console.log(lastUpdatedDate, "lastUpdatedDate는 이것이다");
      console.log(checkingDate, "checkingDate");
      const oneDay = 86400000; //  Milliseconds for a day

      // 시간 상관없이 요일끼리만 비교하기 위해 모든 시간은 0으로 설정
      const lastUpdatedZeroHour = new Date(
        lastUpdatedDate.getFullYear(),
        lastUpdatedDate.getMonth(),
        lastUpdatedDate.getDate(),
        0
      );
      console.log(lastUpdatedZeroHour, "lastUpdatedZeroHour다!");

      const checkingZeroHour = new Date(
        checkingDate.getFullYear(),
        checkingDate.getMonth(),
        checkingDate.getDate(),
        0
      );

      console.log(checkingZeroHour, "checkingZeroHour");

      
      // 요일초기화 기준, 각 요일에 따라 며칠을 더한 값보다 크거나 며칠을 더한 값보다 작아 일 -> 월 혹은 월 -> 일 이렇게 주가 바뀌게 될 때 0으로 초기화
      if (checkingZeroHour.getDay() === 0) {
        console.log(lastUpdatedZeroHour <= checkingZeroHour - 7 * oneDay? true : false, "111")
        console.log(checkingZeroHour + 1 * oneDay <= lastUpdatedZeroHour? true : false, "222")
        if (
          lastUpdatedZeroHour <= checkingZeroHour - 7 * oneDay || checkingZeroHour + 1 * oneDay <= lastUpdatedZeroHour
        ) {
          // lastUpdatedZeroHour <= checkingZeroHour - 7*oneDay || checkingZeroHour + 1*oneDay <= lastUpdatedZeroHour
          // 요일 초기화 실행
          console.log("초기화 가즈아");

          await User.update({lastUpdated: checkingDate}, {where: {id}});

          console.log("1111업데이트는 됐나?");
          // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
          await WeekRecord.updateMany(
            { userId: id },
            {
              $set: { mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0 },
            }
          );
          weekdaysRecord = await WeekRecord.find(
            { userId: id },
            { _id: 0, __v: 0 }
          );
        }
        console.log("WeekRecord업데이트는 됐나?");
      } else {
        if (
          lastUpdatedZeroHour <= checkingZeroHour - checkingZeroHour.getDay() * oneDay || checkingZeroHour + (8 - checkingZeroHour.getDay()) * oneDay <= lastUpdatedZeroHour
        ) {
          // 요일 초기화 실행

          // await User.update({
          //   where: {
          //     id,
          //   },
          //   lastUpdated: checkingDate,
          // });

          await User.update({lastUpdated: checkingDate}, {where: {id}});
          console.log("2222222업데이트는 됐나?");
          // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
          await WeekRecord.updateMany(
            { userId: id },
            {
              $set: { mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0 },
            }
          );
          console.log("222222222WeekRecord업데이트는 됐나?");
          weekdaysRecord = await WeekRecord.find(
            { userId: id },
            { _id: 0, __v: 0 }
          );

          console.log("초기화 가즈아2");
        }
      }

      // //find the year of the current date
      // let oneJan = new Date(lastUpdatedDate.getFullYear(), 0, 1);

      // // calculating number of days in given year before a given date, 일수 계산
      // let numberOfDays = Math.floor(
      //   (lastUpdatedDate - oneJan) / (24 * 60 * 60 * 1000)
      // );

      // console.log(numberOfDays, "numberOfDays");

      // // adding 1 since to current date and returns value starting from 0
      // let result = Math.ceil((lastUpdatedDate.getDay() + 1 + numberOfDays) / 7);
      // console.log(result);
      // //display the calculated result
      // console.log(
      //   "Week Numbers of current date (" + lastUpdatedDate + ") is:" + result
      // );

      // ////////////////체크하는 시점이 몇 주차에 속해 있는지 구하기
      // // 시간을 한국 시간으로 바꾸기, 서버가 북미에서 돌아가고 있기 떄문에 날짜 설정을 한국 기준으로 해줄 필요가 있다.
      // const today = new Date();

      // const utc = today.getTime() + today.getTimezoneOffset() * 60 * 1000;

      // // 3. UTC to KST (UTC + 9시간)
      // const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
      // const kr_curr = new Date(utc + KR_TIME_DIFF);
      // const checkingDate = kr_curr;

      // //find the year of the current date
      // let oneJan2 = new Date(checkingDate.getFullYear(), 0, 1);

      // // calculating number of days in given year before a given date
      // let numberOfDays2 = Math.floor(
      //   (checkingDate - oneJan2) / (24 * 60 * 60 * 1000)
      // );

      // // adding 1 since to current date and returns value starting from 0
      // let result2 = Math.ceil((checkingDate.getDay() + 1 + numberOfDays2) / 7);
      // console.log(result2);
      // //display the calculated result
      // console.log(
      //   "Week Numbers of current date (" + checkingDate + ") is:" + result2
      // );

      // 각각의 날짜가 속한 주차가 같은지 혹은 같은 주차에 속해있지만 연도가 다른지
      // if (
      //   result !== result2 ||
      //   lastUpdatedDate.getFullYear() !== checkingDate.getFullYear()
      // ) {
      //   const dateForLastUpdated = checkingDate;

      //   // // how could I get the data from this Monday?
      //   // // we should get all categories' time record which starts from Monday.
      //   // // I have to check time and update at 1) leaving room 2) checking the time graph 방을 나갈 때, 기록을 조회할 때 둘 다 시점을 체크해야 한다.
      //   //// 그렇지 않으면 오랜만에 로그인한 유저가 시간을 조회하기 전에 방에 참여했다가 나오면서 지난 주, 지지난주 누적된 시간으로 뱃지를 받을 수 있기 때문!

      // }

      ////////////// <월간 기록>
      let monthRecord = await MonthRecord.find(
        { userId: id },
        { _id: 0, __v: 0 }
      );
      console.log("월간 기록을 가져온다", monthRecord);
      // date 는 사용자가 방에 들어온 시점을 가리킴
      if (monthRecord.length === 0) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      }

      /////////// 마지막으로 기록된 시점과 현재 기록 조회하는 시점이 동일한 월에 속해 있는지 비교하고 속해있지 않다면 몇월인지 알려주며 월간 기록 리셋해주기

      // 마지막으로 업데이트된 날짜가 몇번째 달에 속해 있는지 구하기
      // 주는 같아도 월화수목금토일이 8월말 9월초 처럼 월이 달라지는 경우가 생기기 떄문에 주간 기록의 lastUpdated와 별도의 열 lastUpdatedDate을 MonthRecord 모델에 생성

      const lastUpdatedMonth = monthRecord[0].lastUpdatedDate.getMonth() + 1; // 배열 형태로 나올 것이기에 그 중 아무것이나 지정

      // 체크하는 시점이 몇번째 달에 속해 있는지 구하기
      // const checkingDate = new Date();

      const checkingMonth = checkingDate.getMonth() + 1; // since January gives 0

      // 각각의 날짜가 속한 달이 같은지 혹은 같은 달에 속해있지만 연도가 다른지
      if (
        lastUpdatedMonth !== checkingMonth || monthRecord[0].lastUpdatedDate.getFullYear() !== checkingDate.getFullYear()
      ) {

        console.log(checkingDate, "잘 넘어오기는 하네 checkingDate는 이거다")
        await MonthRecord.updateMany(
          { userId: id },
          { $set: { time: 0, lastUpdatedDate: checkingDate } }
        );
        monthRecord = await MonthRecord.find(
          { userId: id },
          { _id: 0, __v: 0 }
        );
      }

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

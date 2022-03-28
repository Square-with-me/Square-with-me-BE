// models
const { User } = require("../models");

// Mongo DB 시간기록
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

module.exports = {
  koreanDate: () => {
    // 1. 현재 PC 표준 시간
    const curr = new Date();

    // 2. UTC 시간 계산
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;

    // 3. UTC to KST (UTC + 9시간)
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_curr = new Date(utc + KR_TIME_DIFF);

    return kr_curr;
  },

  weekRecordInitChecking: async (id, krToday) => {
    let weekdaysRecord = await WeekRecord.find(
      { userId: id },
      { _id: 0, __v: 0 }
    );

    if (weekdaysRecord.length === 0) {
      return { msg: "일치하는 유저 정보가 없습니다.", };
    }

    const user = await User.findOne({
      where: {
        id,
      },
    });

    const lastUpdatedDate = user.lastUpdated; // 여기에 마지막 업데이트 된 날짜 넣어야함
    const checkingDate = krToday;

    const oneDay = 86400000; //  Milliseconds for a day

    // 시간 상관없이 요일끼리만 비교하기 위해 모든 시간은 0으로 설정
    const lastUpdatedZeroHour = new Date(
      lastUpdatedDate.getFullYear(),
      lastUpdatedDate.getMonth(),
      lastUpdatedDate.getDate(),
      0
    );
    const checkingZeroHour = new Date(
      checkingDate.getFullYear(),
      checkingDate.getMonth(),
      checkingDate.getDate(),
      0
      );

    // 요일초기화 기준, 각 요일에 따라 며칠을 더한 값보다 크거나 며칠을 더한 값보다 작아 일 -> 월 혹은 월 -> 일 이렇게 주가 바뀌게 될 때 0으로 초기화
    if (checkingZeroHour.getDay() === 0) {  // 일요일
      if (
        lastUpdatedZeroHour <= checkingZeroHour - 7 * oneDay ||  // 주가 다를 때
        checkingZeroHour + 1 * oneDay <= lastUpdatedZeroHour
      ) {
        // 요일 초기화 실행
        await User.update({ lastUpdated: checkingDate }, { where: { id } });

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
    } else {  // 월요일 ~ 토요일
      if (
        lastUpdatedZeroHour <= checkingZeroHour - checkingZeroHour.getDay() * oneDay ||
        checkingZeroHour + ( 8 - checkingZeroHour.getDay() ) * oneDay <= lastUpdatedZeroHour
      ) {
        // 요일 초기화 실행
        await User.update({ lastUpdated: checkingDate }, { where: { id } });

        // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
        const result = await WeekRecord.updateMany(
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
    }

    return weekdaysRecord;
  },

  monthRecordInitChecking: async (id, krToday) => {
    let monthRecord = await MonthRecord.find(
      { userId: id },
      { _id: 0, __v: 0 }
    );

    if (monthRecord.length === 0) {
      return { msg: "일치하는 유저 정보가 없습니다." };
    }
    const checkingDate = krToday;

    /////////// 마지막으로 기록된 시점과 현재 기록 조회하는 시점이 동일한 월에 속해 있는지 비교하고 속해있지 않다면 몇월인지 알려주며 월간 기록 리셋해주기

    // 마지막으로 업데이트된 날짜가 몇번째 달에 속해 있는지 구하기
    // 주는 같아도 월화수목금토일이 8월말 9월초 처럼 월이 달라지는 경우가 생기기 때문에 주간 기록의 lastUpdated와 별도의 열 lastUpdatedDate을 MonthRecord 모델에 생성

    const lastUpdatedMonth = monthRecord[0].lastUpdatedDate.getMonth() + 1; // 월간 기록의 최근 업데이트 된 달
    const checkingMonth = checkingDate.getMonth() + 1; // 이번 달
    
    if (
      lastUpdatedMonth !== checkingMonth ||  // 달이 다르거나
      monthRecord[0].lastUpdatedDate.getFullYear() !== checkingDate.getFullYear()  // 연도가 다를 때
    ) {
      await MonthRecord.updateMany(
        { userId: id },
        { $set: { time: 0, lastUpdatedDate: checkingDate } }
      );
      monthRecord = await MonthRecord.find({ userId: id }, { _id: 0, __v: 0 });
    }

    return monthRecord;
  },
};

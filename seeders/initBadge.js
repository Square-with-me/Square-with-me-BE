'use strict';
// 1. 현재 PC 표준 시간
const curr = new Date();

// 2. UTC 시간 계산
const utc = 
      curr.getTime() + 
      (curr.getTimezoneOffset() * 60 * 1000);

// 3. UTC to KST (UTC + 9시간)
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
const kr_curr = 
      new Date(utc + (KR_TIME_DIFF));

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    // 컬럼 속성 변경용
    //  await queryInterface.changeColumn('badges', 'leftBadges', {
    //   type: Sequelize.INTEGER,
    //   allowNull: true,
    //   defaultValue: 0,
    // })

    // 테이블 내부 레코드 값 변경용
    await queryInterface.bulkInsert("badges", [
      {
        name: "beauty",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "뷰티 카테고리 1시간 달성 시 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/beauty.svg",
      }, {
        name: "sports",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "스포츠 카테고리 1시간 달성 시 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/sports.svg",
      }, {
        name: "study",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "스터디 카테고리 1시간 달성 시 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/study.svg",
      }, {
        name: "counseling",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "상담 카테고리 1시간 달성 시 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/counseling.svg",
      }, {
        name: "culture",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "문화 카테고리 1시간 달성 시 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/culture.svg",
      }, {
        name: "etc",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "기타 카테고리 1시간 달성 시 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/etc.svg",
      }, {
        name: "firstCome",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "선착순 100명에게만 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/firstCome.svg",
        leftBadges: 100,
      }, {
        name: "reviewer",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "버그나 리뷰를 제보해주신에게 지급되는 뱃지입니다.",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/bug.svg",
      }, {
        name: "lock",
        createdAt: kr_curr,
        updatedAt: kr_curr,
        desc: "잠긴 뱃지",
        imageUrl: "https://square-with-me-bucket.s3.ap-northeast-2.amazonaws.com/badges/lock.svg"
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    
    
  }
};

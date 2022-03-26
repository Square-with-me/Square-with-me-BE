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

    await queryInterface.bulkInsert("categories", [
      {
        name: "뷰티",
        createdAt: kr_curr,
        updatedAt: kr_curr,
      }, {
        name: "운동",
        createdAt: kr_curr,
        updatedAt: kr_curr,
      }, {
        name: "스터디",
        createdAt: kr_curr,
        updatedAt: kr_curr,
      }, {
        name: "상담",
        createdAt: kr_curr,
        updatedAt: kr_curr,
      }, {
        name: "문화",
        createdAt: kr_curr,
        updatedAt: kr_curr,
      }, {
        name: "기타",
        createdAt: kr_curr,
        updatedAt: kr_curr,
      }
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

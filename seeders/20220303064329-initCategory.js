'use strict';

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
        desc: "헤어, 화장, 패션, 성형",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "운동",
        desc: "다이어트, 헬스, 근손실",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "스터디",
        desc: "공부, 프로그래밍, 시사, 토론, 독서, 과학, 컴퓨터/IT",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "상담",
        desc: "취업, 진로, 알바, 연애, 사주, 타로, 금융, 법률, 의료, 인테리어",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "문화",
        desc: "미술, 음악, 댄스, 노래, 영화/드라마, 연예인, 애니, 게임, 여행",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "기타",
        desc: "ASMR, 명상/마음챙김, 수면, 요리, 반려동물, 공포/미스터리",
        createdAt: new Date,
        updatedAt: new Date,
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

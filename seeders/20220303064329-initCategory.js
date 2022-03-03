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
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "운동",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "스터디",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "상담",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "문화",
        createdAt: new Date,
        updatedAt: new Date,
      }, {
        name: "기타",
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

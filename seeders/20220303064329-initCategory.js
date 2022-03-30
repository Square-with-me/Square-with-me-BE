'use strict';
const { koreanDate: krToday } = require("../utils/date")

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
        createdAt: krToday(),
        updatedAt: krToday(),
      }, {
        name: "운동",
        createdAt: krToday(),
        updatedAt: krToday(),
      }, {
        name: "스터디",
        createdAt: krToday(),
        updatedAt: krToday(),
      }, {
        name: "상담",
        createdAt: krToday(),
        updatedAt: krToday(),
      }, {
        name: "문화",
        createdAt: krToday(),
        updatedAt: krToday(),
      }, {
        name: "기타",
        createdAt: krToday(),
        updatedAt: krToday(),
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
'use strict';
// const krToday = require("../utils/timeRecord").koreanDate()

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
  //  일회성 컬럼 추가용
    //  queryInterface.addColumn('users', 'lastUpdated', {
    //   type: Sequelize.DATE,
    //     allowNull: false,
    //   defaultValue: krToday,
    // })

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

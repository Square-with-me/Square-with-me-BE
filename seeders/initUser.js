'use strict';
// const krToday = require("../utils/date").koreanDate()

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
     queryInterface.addColumn('users', 'newBadge', {
      type: Sequelize.INTEGER,
        allowNull: true,
    })

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

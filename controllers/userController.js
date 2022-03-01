// utils
const { asyncWrapper } = require("../utils/module");

// models


module.exports = {
  create: {
    user: asyncWrapper(async (req, res) => {
      // Controller, AsyncWrapper 사용 예시
      // 로직 작성
    }),
  },

  update: {

  },

  get: {

  },

  delete: {

  },
};
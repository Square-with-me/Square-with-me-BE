module.exports = {
  regex: {

  },

  asyncWrapper: asyncFn => {
    return (async (req, res, next) => {
      try {
        return await asyncFn(req, res, next);
      } catch(error) {
        console.error(error);
        return res.status(500).json({
          isSuccess: false,
          msg: "서버 내부 에러",
        });
      };
    });
  },
};
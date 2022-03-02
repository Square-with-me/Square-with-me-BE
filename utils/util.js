module.exports = {
  regex: {
    checkEmail: (email) => {
      const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

      const isValid = regex.test(email);

      return isValid;
    },

    checkNickname: (nickname) => {
      const regex = /[!@#$%^&*()_\-+=~`{}\[\]\\|"':;<>,.\/?]/g;

      const isValid = !nickname.match(regex);
      
      return isValid ? true : false;
    }
  },

  asyncWrapper: asyncFn => {
    return (async (req, res, next) => {
      try {
        return await asyncFn(req, res, next);
      } catch(error) {
        console.error(error);
        return res.status(500).json({
          isSuccess: false,
          msg: "Internal Server Error",
        });
      };
    });
  },

  createStatusMsg: () => {
    const msgs = [
      "오늘도 아자아자!!",
      "밤하늘의 별..2 되고ㅍr",
      "오늘도.. 나는 고독과 싸운다.",
      "너와 함께라면 할 수 잇어!!",
      "너 나 우리.. 모두의 힘을 모아",
      "실패란 뭘까... 알고싶어..^;",
      "실패는 성공의 어머니!",
      "두렵냐? 나도 두렵다.. 함께하자!!",
    ];

    const length = msgs.length;

    const randomIdx = Math.floor(Math.random() * length);
    return msgs[randomIdx];
  },

};
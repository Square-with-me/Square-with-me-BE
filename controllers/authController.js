const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// utils
const { regex, asyncWrapper, createStatusMsg } = require("../utils/util");

// models
const { User } = require("../models");

module.exports = {
  local: asyncWrapper(async (req, res) => {
    const { origin, nickname, pwd } = req.body;
    
    if(pwd.length < 8 || pwd.length > 16) {
      return res.status(400).json({
        isSuccess: false,
        msg: "비밀번호가 올바르지 않습니다.",
      });
    };

    if(!regex.checkEmail(origin)) {
      return res.status(400).json({
        isSuccess: false,
        msg: "이메일 형식이 올바르지 않습니다.",
      });
    };

    if(!regex.checkNickname(nickname)) {
      return res.status(400).json({
        isSuccess: false,
        msg: "닉네임에 특수문자를 사용할 수 없습니다.",
      });
    };

    const isExistOrigin = await User.findOne({
      where: { origin },
    });
    if(isExistOrigin) {
      return res.status(400).json({
        isSuccess: false,
        msg: "이미 존재하는 이메일입니다.",
      });
    };

    const isExistNickname = await User.findOne({
      where: { nickname: nickname },
    });
    if(isExistNickname) {
      return res.status(400).json({
        isSuccess: false,
        msg: "이미 존재하는 닉네임입니다.",
      });
    };

    const hashedPwd = bcrypt.hashSync(pwd, 10);
    await User.create({
      origin,
      nickname,
      pwd: hashedPwd,
      statusMsg: createStatusMsg(),
      type: "local",
    });

    return res.status(201).json({
      isSuccess: true,
      msg: "회원가입에 성공하였습니다.",
    });
  }),

  kakao: (req, res, next) => {
    passport.authenticate("kakao",
      { failureRedirect: "/" },
      (error, user, info) => {
        if(error) {
          return next(error);
        };

        const { origin } = user;
        const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

        res.json({
          isSuccess: true,
          data: {
            token,
            user,
          }
        });
      }
    )(req, res, next);
  },
};
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// utils
const {
  regex,
  asyncWrapper,
  createStatusMsg, createAnonOrigin
} = require("../utils/util");

// models
const { User, Badge, WeekRecord, MonthRecord } = require("../models");

module.exports = {
  create: {
    local: asyncWrapper(async (req, res) => {
      const { origin, nickname, pwd } = req.body;

      if(!regex.checkEmail(origin)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 형식이 올바르지 않습니다.",
        });
      };
  
      if(nickname.length < 2 || nickname.length > 8) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임은 2글자 ~ 8글자로 적어주세요."
        });
      };
  
      if(!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다.",
        });
      };

      if(pwd.length < 8 || pwd.length > 16) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 올바르지 않습니다.",
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
      const user = await User.create({
        origin,
        nickname,
        pwd: hashedPwd,
        statusMsg: createStatusMsg(),
        type: "local",
      });

      // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가
      await WeekRecord.create({
        userId: user.id,
      });

      for(let i = 1; i <= 31; i++) {
        await MonthRecord.create({
          userId: user.id,
          date: i,
          time: 0,
        });
      };
  
      return res.status(201).json({
        isSuccess: true,
        msg: "회원가입에 성공하였습니다.",
      });
    }),
  
    kakao: (req, res, next) => {
      passport.authenticate("kakao",
        (error, user) => {
          if(error) {
            return res.status(500).json({
              isSuccess: false,
              msg: "카카오 로그인 오류",
            });
          };

          const { origin } = user;
          const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

          // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가
          await WeekRecord.create({
            userId: user.id,
          });

          for(let i = 1; i <= 31; i++) {
            await MonthRecord.create({
              userId: user.id,
              date: i,
              time: 0,
            });
          };

          res.json({
            isSuccess: true,
            data: {
              token,
              user,
            }
          });
        }
      )(req, res, next);  // 미들웨어 확장
    },

    anon: asyncWrapper(async (req, res) => {
      const anonOrigin = createAnonOrigin();

      const anonUser = await User.create({
        origin: anonOrigin,
        nickname: "익명의 유저",
        pwd: "0",
        statusMsg: "익명의 유저입니다.",
        type: "anon",
      })

      const token = jwt.sign({ origin: anonOrigin }, process.env.JWT_SECRET_KEY);

      return res.status(201).json({
        isSuccess: true,
        data: {
          user: anonUser,
          token,
        },
      });
    }),
  },
  
  get: {
    auth: asyncWrapper(async (req, res) => {
      const { origin, pwd } = req.body;

      if(!origin || !pwd) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 입력하세요.",
        });
      };

      const user = await User.findOne({
        where: { origin },
      });
      if(!user) {
        return res.status(400).json({
          isSuccess: false,
          msg: "존재하지 않는 이메일입니다.",
        });
      };

      const pwdCheck = bcrypt.compareSync(pwd, user.pwd);
      if(!pwdCheck) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 틀렸습니다.",
        });
      };

      const fullUser = await User.findOne({
        where: {
          origin,
          type: "local",
        },
        attributes: ["id", "origin", "nickname", "profileImg", "statusMsg", "type"],
        include: [{
          model: Badge,
          as: "MasterBadge",
          attributes: ["id", "name"],
        }],
      });
      const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

      return res.status(200).json({
        isSuccess: true,
        data: {
          token,
          user: fullUser,
        },
      });
    }),
  },

  delete: {
    auth: asyncWrapper(async (req, res) => {
      const { type } = req.params;
      const { id } = res.locals.user;

      switch(type) {
        case "local":
          break;
        case "kakao":
          break;
        case "anon":
          await User.destroy({
            where: { id },
          })
          break;
      };

      return res.status(200).json({
        isSuccess: true,
      })
    }),
  }
};
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// utils
const {
  regex,
  asyncWrapper,
  createStatusMsg,
  createAnonOrigin,
} = require("../utils/util");
const { koreanDate } = require("../utils/date");

// MySQL models
const { User, Badge } = require("../models");

// Mongo collections
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

// let newBadge = 0; // UserController에 전달될 newBadge 전역변수 저장



module.exports = {
  create: {
    local: asyncWrapper(async (req, res) => {
      const { origin, nickname, pwd } = req.body;

      if (!regex.checkEmail(origin)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 형식이 올바르지 않습니다.",
        });
      }

      if (nickname.length < 2 || nickname.length > 8) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임은 2글자 ~ 8글자로 적어주세요.",
        });
      }

      if (!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다.",
        });
      }

      if (pwd.length < 8 || pwd.length > 16) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 올바르지 않습니다.",
        });
      }

      const isExistOrigin = await User.findOne({
        where: { origin },
      });
      if (isExistOrigin) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 이메일입니다.",
        });
      }

      const isExistNickname = await User.findOne({
        where: { nickname: nickname },
      });
      if (isExistNickname) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 닉네임입니다.",
        });
      }

      const hashedPwd = bcrypt.hashSync(pwd, 10);

      const user = await User.create({
        origin,
        nickname,
        pwd: hashedPwd,
        statusMsg: createStatusMsg(),
        type: "local",
        lastUpdated: new Date(), // DB 시간을 한국 시간으로 맞추어 놓았으므로 별도로 계산하지 않음, koreanDate()를 쓸 경우 9시간 후의 미래시간이 찍히는 문제 발생
      });

      // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가
      await WeekRecord.insertMany([
        { userId: user.id, category: "beauty",mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "sports",mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "study",mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "counseling",mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "culture",mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "etc",mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
      ]);

      await MonthRecord.insertMany([
        { userId: user.id, date: 1, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 2, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 3, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 4, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 5, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 6, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 7, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 8, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 9, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 10, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 11, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 12, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 13, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 14, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 15, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 16, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 17, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 18, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 19, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 20, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 21, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 22, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 23, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 24, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 25, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 26, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 27, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 28, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 29, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 30, time: 0, lastUpdatedDate: koreanDate() },
        { userId: user.id, date: 31, time: 0, lastUpdatedDate: koreanDate() },
      ]);

      return res.status(201).json({
        isSuccess: true,
        msg: "회원가입에 성공하였습니다.",
      });
    }),

    kakao: (req, res, next) => {
      passport.authenticate(
        "kakao",
        asyncWrapper(async (error, user) => {
          if (error) {
            return res.status(500).json({
              isSuccess: false,
              msg: "카카오 로그인 오류",
            });
          }

          const { origin } = user;
          const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

          const firstComeBadge = await Badge.findOne({
            where: {
              name: "firstCome",
            },
          });
          const isGivenBadge = await user.getMyBadges({
            where: { id: firstComeBadge.id, },
          });
            console.log("isGivenBadge다ㅏㅏㅏㅏ", isGivenBadge)
          const leftBadge = firstComeBadge.leftBadges;

          console.log(leftBadge, "leftbadge aaaaaaa")
          if (isGivenBadge.length === 0 && 0 < leftBadge) {
            await firstComeBadge.decrement("leftBadges");
          console.log("decrement가 실행되었다ㅏㅏㅏㅏㅏㅏ")

            await user.addMyBadges(
              firstComeBadge.id
            );
            // newBadge = firstComeBadge.id 

            await user.update({newBadge: firstComeBadge.id})

            res.status(200).json({
              isSuccess: true,
              data: {
                token,
              },
              // newBadge: firstComeBadge,
            });
          } else {
            res.status(200).json({
              isSuccess: true,
              data: {
                token,
                user, // ch: 왜 주는 걸까?? 이유가 없다면 없애버리고 return 통합하는게 좋을 듯
              },
            });
          }
        })
      )(req, res, next); // 미들웨어 확장
    },
  },

  get: {
    auth: asyncWrapper(async (req, res) => {
      const { origin, pwd } = req.body;

      if (!origin || !pwd) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 입력하세요.", 
        });
      }

      const user = await User.findOne({
        where: { origin },
      });
      if (!user) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 확인해주세요.", 
        });
      }

      const pwdCheck = bcrypt.compareSync(pwd, user.pwd);
      if (!pwdCheck) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 확인해주세요.", 
        });
      }

      const fullUser = await User.findOne({
        where: {
          origin,
          type: "local",
        },
        attributes: [
          "id",
          "origin",
          "nickname",
          "profileImg",
          "statusMsg",
          "type",
        ],
        include: [
          {
            model: Badge,
            as: "MasterBadge",
            attributes: ["id", "name", "imageUrl"],
          },
        ],
      });
      const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

      // 로컬 로그인 뱃지 지급
      const firstComeBadge = await Badge.findOne({
        where: {
          name: "firstCome",
        },
      });
      const isGivenBadge = await user.getMyBadges({
        where: { id: firstComeBadge.id, },
      })

      // 100번째 까지 모두 지급되었는지 확인
      const leftBadge = firstComeBadge.leftBadges;
      
      if (isGivenBadge.length === 0 && user.type === "local" && 0 < leftBadge) {
        
        await firstComeBadge.decrement("leftBadges");
        
        await user.addMyBadges(firstComeBadge.id);

        await user.update({newBadge: firstComeBadge.id})
        // newBadge = firstComeBadge.id
      }

        return res.status(200).json({
          isSuccess: true,
          data: {
            token,
          },
        });
      
      // else {
      //   return res.status(200).json({
      //     isSuccess: true,
      //     data: {
      //       token,
      //     },
      //   });
      // }
    }),
    // newBadge: () => {
    //   console.log("autoController_notCookie쪽에서 newBadge 호출됐을 때");
    //   return newBadge;
    // },
    // newBadgeInit: () => {
    //   console.log("Init이 되어버린다ㅏㅏㅏㅏㅏㅏㅏㅏ");
    //   newBadge = 0;
    // },
  },
  

  delete: {
    auth: asyncWrapper(async (req, res) => {
      const { type } = req.params;
      const { id } = res.locals.user;

      switch (type) {
        case "local":
          break;
        case "kakao":
          break;
        case "anon":
          await User.destroy({
            where: { id },
          });
          break;
      }

      return res.status(200).json({
        isSuccess: true,
      });
    }),
  },
};
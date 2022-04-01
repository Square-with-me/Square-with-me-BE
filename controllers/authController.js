const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// utils
const {
  regex,
  asyncWrapper,
  createStatusMsg,
  createAnonOrigin,
} = require("../utils/util");

// models
const { User, Badge, RefreshToken } = require("../models");

// Mongo DB 시간기록
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

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

      });

      // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가

      await WeekRecord.insertMany([
        { userId: user.id, category: "beauty", mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "sports", mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "study", mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "counseling", mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "culture", mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
        { userId: user.id, category: "etc", mon: 0, tue: 0, wed: 0, thur:0, fri:0, sat:0, sun:0 },
      ]);

      await MonthRecord.insertMany([
        { userId: user.id, date: 1, time: 0 },
        { userId: user.id, date: 2, time: 0 },
        { userId: user.id, date: 3, time: 0 },
        { userId: user.id, date: 4, time: 0 },
        { userId: user.id, date: 5, time: 0 },
        { userId: user.id, date: 6, time: 0 },
        { userId: user.id, date: 7, time: 0 },
        { userId: user.id, date: 8, time: 0 },
        { userId: user.id, date: 9, time: 0 },
        { userId: user.id, date: 10, time: 0 },
        { userId: user.id, date: 11, time: 0 },
        { userId: user.id, date: 12, time: 0 },
        { userId: user.id, date: 13, time: 0 },
        { userId: user.id, date: 14, time: 0 },
        { userId: user.id, date: 15, time: 0 },
        { userId: user.id, date: 16, time: 0 },
        { userId: user.id, date: 17, time: 0 },
        { userId: user.id, date: 18, time: 0 },
        { userId: user.id, date: 19, time: 0 },
        { userId: user.id, date: 20, time: 0 },
        { userId: user.id, date: 21, time: 0 },
        { userId: user.id, date: 22, time: 0 },
        { userId: user.id, date: 23, time: 0 },
        { userId: user.id, date: 24, time: 0 },
        { userId: user.id, date: 25, time: 0 },
        { userId: user.id, date: 26, time: 0 },
        { userId: user.id, date: 27, time: 0 },
        { userId: user.id, date: 28, time: 0 },
        { userId: user.id, date: 29, time: 0 },
        { userId: user.id, date: 30, time: 0 },
        { userId: user.id, date: 31, time: 0 },
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

          // const { origin } = user;
          // const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

          //리프레시토큰
          const existToken = await RefreshToken.findOne({
            userId: user.id,
          });
          if (existToken) {
            return res.status(400).json({
              isSuccess: false,
              msg: "이미 로그인 중입니다.",
            });
          }

          const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1d",
            }
          );

          let expiredAt = new Date();
          expiredAt.setDate(expiredAt.getDate() + 1);

          await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
            expiryDate: expiredAt.getTime(),
          });

          //엑세스토큰
          const accessToken = jwt.sign(
            { origin: user.origin },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
          }); //options 참고 : https://www.npmjs.com/package/cookie
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
          });

          const firstComeBadge = await Badge.findOne({
            where: {
              name: "firstCome",
            },
          });
          const isGivenBadge = await user.getMyBadges({
            where: {
              id: firstComeBadge.id,
            },
          });

          // 100번째 까지 모두 지급되었는지 확인
          const leftBadge = firstComeBadge.leftBadges;

          if (isGivenBadge.length === 0 && 0 < leftBadge) {
            await firstComeBadge.decrement("leftBadges");

            await user.addMyBadges(
              firstComeBadge.id // 특정 유저에게 선착순 뱃지가 없으므로 해당 유저의 아이디에 선착순 유저 뱃지 지급
            );

            res.status(200).json({
              isSuccess: true,
              data: {
                user,
                newBadge: firstComeBadge,
              },
            });
          } else {
            res.status(200).json({
              isSuccess: true,
              data: {
                user,
              },
            });
          }
        })
      )(req, res, next); // 미들웨어 확장
    },

    anon: asyncWrapper(async (req, res) => {
      const anonOrigin = createAnonOrigin();

      const anonUser = await User.create({
        origin: anonOrigin,
        nickname: "익명의 유저",
        pwd: "0",
        statusMsg: "익명의 유저입니다.",
        type: "anon",
      });

      const token = jwt.sign(
        { origin: anonOrigin },
        process.env.JWT_SECRET_KEY
      );

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
          msg: "존재하지 않는 이메일입니다.",
        });
      }

      const pwdCheck = bcrypt.compareSync(pwd, user.pwd);
      if (!pwdCheck) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 틀렸습니다.",
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
            attributes: ["id", "name"],
          },
        ],
      });

      //리프레시토큰
      const existToken = await RefreshToken.findOne({
        userId: user.id,
      });
      if (existToken) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 로그인 중입니다.",
        });
      }

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      let expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + 1);

      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiryDate: expiredAt.getTime(),
      });

      //엑세스토큰
      const accessToken = jwt.sign(
        { origin: user.origin },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
      }); //options 참고 : https://www.npmjs.com/package/cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
      });

      // 로컬로그인 뱃지 지급
      const firstComeBadge = await Badge.findOne({
        where: {
          name: "firstCome",
        },
      });
      const isGivenBadge = await user.getMyBadges({
        where: {
          id: firstComeBadge.id,
        },
      });

      // 100번째 까지 모두 지급되었는지 확인
      const leftBadge = firstComeBadge.leftBadges;

      if (isGivenBadge.length === 0 && user.type === "local" && 0 < leftBadge) {
        await user.addMyBadges(
          firstComeBadge.id // 특정 유저에게 선착순 뱃지가 없으므로 해당 유저의 아이디에 선착순 유저 뱃지 지급
        );

        return res.status(200).json({
          isSuccess: true,
          data: {
            user: fullUser,
            newBadge: firstComeBadge,
          },
        });
      } else {
        return res.status(200).json({
          isSuccess: true,
          data: {
            user: fullUser,
          },
        });
      }
    }),
  },

  delete: {
    auth: asyncWrapper(async (req, res) => {
      const { type } = req.params;
      const { id } = res.locals.user;

      switch (type) {
        case "local":
          await RefreshToken.destroy({
            where: { userId: id },
          });
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
          break;
        case "kakao":
          await RefreshToken.destroy({
            where: { userId: id },
          });
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
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
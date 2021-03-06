const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// TS
import { Request, Response, NextFunction } from "express";
export const methodForTs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

interface REQuser {
  body: { origin: string; nickname: string; pwd: string };
}
interface userInfo {
  origin: string;
  nickname: string;
  pwd: string;
  id: number;
  type: string;
  lastUpdated: Date;
}
interface RES {
  status: { json: { isSuccess: boolean; msg: string } } | any;
}
interface user extends userInfo {
  newBadge: number;
}

// utils
const { regex, asyncWrapper, createStatusMsg } = require("../utils/util");
const { koreanDate } = require("../utils/date");

// MySQL models
const { User, Badge } = require("../models");

// Mongo collections
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

module.exports = {
  create: {
    local: asyncWrapper(async (req: REQuser, res: RES): Promise<RES> => {
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

      const isExistOrigin: user = await User.findOne({
        where: { origin },
      });
      if (isExistOrigin) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 이메일입니다.",
        });
      }

      const isExistNickname: user = await User.findOne({
        where: { nickname: nickname },
      });
      if (isExistNickname) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 닉네임입니다.",
        });
      }

      const hashedPwd: string = bcrypt.hashSync(pwd, 10);

      const user: userInfo = await User.create({
        origin,
        nickname,
        pwd: hashedPwd,
        statusMsg: createStatusMsg(),
        type: "local",
        lastUpdated: new Date(),
      });

      // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가
      await WeekRecord.insertMany([
        {
          userId: user.id,
          category: "beauty",
          mon: 0,
          tue: 0,
          wed: 0,
          thur: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        },
        {
          userId: user.id,
          category: "sports",
          mon: 0,
          tue: 0,
          wed: 0,
          thur: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        },
        {
          userId: user.id,
          category: "study",
          mon: 0,
          tue: 0,
          wed: 0,
          thur: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        },
        {
          userId: user.id,
          category: "counseling",
          mon: 0,
          tue: 0,
          wed: 0,
          thur: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        },
        {
          userId: user.id,
          category: "culture",
          mon: 0,
          tue: 0,
          wed: 0,
          thur: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        },
        {
          userId: user.id,
          category: "etc",
          mon: 0,
          tue: 0,
          wed: 0,
          thur: 0,
          fri: 0,
          sat: 0,
          sun: 0,
        },
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

    kakao: (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate(
        "kakao",
        asyncWrapper(async (error: any, user: any) => {
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
            where: { id: firstComeBadge.id },
          });
          const leftBadge = firstComeBadge.leftBadges;

          if (isGivenBadge.length === 0 && 0 < leftBadge) {
            await firstComeBadge.decrement("leftBadges");

            await user.addMyBadges(firstComeBadge.id);

            await user.update({ newBadge: firstComeBadge.id });
          }

          res.status(200).json({
            isSuccess: true,
            data: {
              token,
            },
          });
        })
      )(req, res, next); // 미들웨어 확장
    },
  },

  get: {
    auth: asyncWrapper(
      async (req: { body: { origin: string; pwd: string } }, res: Response) => {
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

        const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

        // 로컬 로그인 뱃지 지급
        const firstComeBadge = await Badge.findOne({
          where: {
            name: "firstCome",
          },
        });
        const isGivenBadge = await user.getMyBadges({
          where: { id: firstComeBadge.id },
        });

        // 100번째 까지 모두 지급되었는지 확인
        const leftBadge = firstComeBadge.leftBadges;

        if (
          isGivenBadge.length === 0 &&
          user.type === "local" &&
          0 < leftBadge
        ) {
          await firstComeBadge.decrement("leftBadges");
          await user.addMyBadges(firstComeBadge.id);
          await user.update({ newBadge: firstComeBadge.id });
        }

        return res.status(200).json({
          isSuccess: true,
          data: {
            token,
          },
        });
      }
    ),
  },

  delete: {
    auth: asyncWrapper(async (req: Request, res: Response) => {
      return res.status(200).json({
        isSuccess: true,
      });
    }),
  },
};

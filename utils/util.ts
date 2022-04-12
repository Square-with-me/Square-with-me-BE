const { sequelize } = require("../models")
const multer = require("multer");
const path = require("path");

const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

// AWS Config
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2"
});

// TS
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
export const methodForTs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

type objType = {
  [key: number]: string
}

module.exports = {
  regex: {
    checkEmail: (email: string) => {
      const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

      const isValid = regex.test(email);

      return isValid;
    },

    checkNickname: (nickname: string) => {
      const regex = /[!@#$%^&*()_\-+=~`{}\[\]\\|"':;<>,.\/?]/g;

      const isValid = !nickname.match(regex);
      
      return isValid ? true : false;
    }
  },

  // asyncWrapper: (asyncFn: (arg0: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, arg1: Response<any, Record<string, any>>, arg2: NextFunction) => any) => {
  asyncWrapper: (asyncFn: (arg0: Request, arg1: Response, arg2: NextFunction) => any) => {
    return (async (req: Request, res: Response, next: NextFunction) => {
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

  asyncWrapperWithTransaction: (asyncFn: (arg_0: Request, arg_1: Response, arg_2: NextFunction, arg_3: any) => any) => {
    return (async (req: Request, res: Response, next: NextFunction) => {
      const t = await sequelize.transaction();

      try {
        return await asyncFn(req, res, next, t);
      } catch(error) {
        console.error(error);
        await t.rollback();
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

  // 해당 날짜의 요일 가져오기
  getDay: (date: number): string =>  {
    const map: objType = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thur",
      5: "fri",
      6: "sat",
    };

    let fullDate = new Date();
    fullDate.setDate(date);  // date(ex: 23일이면 23) 넣으면 해당 날짜로 설정

    let day = map[fullDate.getDay()];  // 해당 날짜의 요일 가져와서 문자로 치환

    return day;
  },

  s3Upload: multer({
    storage: multerS3({
      s3: new AWS.S3(),
      bucket: "square-with-me-bucket",
      key(req: Request, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void): void {
        cb(null, `images/${Date.now()}_${path.basename(file.originalname)}`)
      }
    })
  }),
};
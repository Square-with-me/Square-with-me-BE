const passport = require("passport");
const { Strategy: KakaoStrategy } = require("passport-kakao");

// models
const {
  User,
  Badge, 
  MonthRecord,  
  BeautyRecord,
  SportsRecord,
  StudyRecord,
  CounselingRecord,
  CultureRecord,
  ETCRecord
} = require("../models");

// utils
const { createStatusMsg } = require("../utils/util");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_REST_API_KEY,
        callbackURL: "https://nemowithme.com/api/auth/kakao/callback",
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: {
              origin: profile.id,
              type: "kakao",
            },
            attributes: ["id", "origin", "nickname", "profileImg", "statusMsg", "type"],
            include: [{
              model: Badge,
              as: "MasterBadge",
              attributes: ["id", "name", "imageUrl"],
            }],
          });
          if(exUser) {
            return done(null, exUser);
            // done(서버 에러, 성공)
            // done(null, success)는 AuthController.kakao의 (error, user)로 넘어가게 됨
          };

          const newUser = await User.create({
            origin: profile.id,
            nickname: profile.displayName,
            profileImg: profile._json.properties.profile_image,
            type: "kakao",
            pwd: "0",
            statusMsg: createStatusMsg(),
          });

          // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가 
          await BeautyRecord.create({
            userId: newUser.id
          })
    
          await SportsRecord.create({
            userId: newUser.id,
          });
    
          await StudyRecord.create({
            userId: newUser.id,
          });
    
          await CounselingRecord.create({
            userId: newUser.id,
          });
    
          await CultureRecord.create({
            userId: newUser.id,
          });
    
          await ETCRecord.create({
            userId: newUser.id,
          });
    
          await MonthRecord.bulkCreate([
            { userId: newUser.id, date: 1 },
            { userId: newUser.id, date: 2 },
            { userId: newUser.id, date: 3 },
            { userId: newUser.id, date: 4 },
            { userId: newUser.id, date: 5 },
            { userId: newUser.id, date: 6 },
            { userId: newUser.id, date: 7 },
            { userId: newUser.id, date: 8 },
            { userId: newUser.id, date: 9 },
            { userId: newUser.id, date: 10 },
            { userId: newUser.id, date: 11 },
            { userId: newUser.id, date: 12 },
            { userId: newUser.id, date: 13 },
            { userId: newUser.id, date: 14 },
            { userId: newUser.id, date: 15 },
            { userId: newUser.id, date: 16 },
            { userId: newUser.id, date: 17 },
            { userId: newUser.id, date: 18 },
            { userId: newUser.id, date: 19 },
            { userId: newUser.id, date: 20 },
            { userId: newUser.id, date: 21 },
            { userId: newUser.id, date: 22 },
            { userId: newUser.id, date: 23 },
            { userId: newUser.id, date: 24 },
            { userId: newUser.id, date: 25 },
            { userId: newUser.id, date: 26 },
            { userId: newUser.id, date: 27 },
            { userId: newUser.id, date: 28 },
            { userId: newUser.id, date: 29 },
            { userId: newUser.id, date: 30 },
            { userId: newUser.id, date: 31 },
          ]);

          return done(null, newUser);
        } catch(error) {
          console.error(error);
          done(error);
        };
      }
    )
  );
};
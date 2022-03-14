const passport = require("passport");
const { Strategy: KakaoStrategy } = require("passport-kakao");

// models
const { User, Badge } = require("../models");

// utils
const { createStatusMsg } = require("../utils/util");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_REST_API_KEY,
        callbackURL: "http://localhost:3000/api/auth/kakao/callback",
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
              attributes: ["id", "name"],
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
          await WeekRecord.create({
            userId: newUser.id,
          });

          for (let i = 1; i <= 31; i++) {
            await MonthRecord.create({
              userId: newUser.id,
              date: i,
              time: 0,
            });
          }

          return done(null, newUser);
        } catch(error) {
          console.error(error);
          done(error);
        };
      }
    )
  );
};
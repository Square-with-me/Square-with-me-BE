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
            attributes: ["id", "origin", "nickname", "profileImg", "statusMsg"],
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
          return done(null, newUser);
        } catch(error) {
          console.error(error);
          done(error);
        };
      }
    )
  );
};
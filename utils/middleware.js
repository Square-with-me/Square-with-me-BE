const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// models
const { User, RefreshToken, Badge } = require("../models");
const { verifyToken } = require("./jwt");
const { asyncWrapper } = require("./util");

// 쿠키 적용 시
// module.exports = {
//   auth: asyncWrapper(async (req, res, next) => {
//     const accessToken = verifyToken(req.cookies.accessToken);
//     const refreshToken = verifyToken(req.cookies.refreshToken);
//     console.log(accessToken);
//     console.log(refreshToken);
//     console.log(req.cookies)
//     const currentRefreshToken =  await RefreshToken.findOne({ //현재 가지고있는 리프레시토큰이
//       where: {userId: refreshToken.id}
//     });
//     if(currentRefreshToken.expiryDate.getTime() < new Date().getTime() || !refreshToken){  //만료되면 DB에서 지움, 쿠키에 토큰이 없어도 지움
//       RefreshToken.destroy({
//         where: {userId: refreshToken.id}
//       })
//     }
//     if (req.cookies.accessToken === undefined) {
//       return res
//         .status(400)
//         .json({ isSuccess: false, msg: "API 사용 권한이 없습니다. 다시 로그인 해주세요." });
//     }

//     if (accessToken === null) {
//       if (refreshToken === undefined) {
//         //access,refresh 둘 다 만료
//         return res.status(400).json({
//           isSuccess: false,
//           msg: "API 사용 권한이 없습니다. 다시 로그인 해주세요.",
//         });
//       } else {
//         // access 만료, refresh 유효
//         const user = await User.findOne({
//           where: { id: refreshToken.id },
//         });
//         if (!user) {
//           return res.status(400).json({ isSuccess: false, msg: "에러" });
//         }
//         const newAccessToken = jwt.sign(
//           { origin: user.origin },
//           process.env.JWT_SECRET_KEY,
//           {
//             expiresIn: '1h',
//           }
//         );
//         res.cookie("accessToken", newAccessToken, { httpOnly: true, sameSite:"lax" });
//         req.cookies.accessToken = newAccessToken;
//       }
//     } else {
//       if (refreshToken === undefined) {
//         // access 유효, refresh 만료
//         const user = await User.findOne({
//           where: { origin: accessToken.origin },
//         });
//         if (!user) {
//           return res.status(400).json({ isSuccess: false, msg: "에러" });
//         }
//         const newRefreshToken = jwt.sign(
//           { id: user.id },
//           process.env.JWT_SECRET_KEY,
//           {
//             expiresIn: '1d',
//           }
//         );
//         let expiredAt = new Date();
//       expiredAt.setDate(
//         expiredAt.getDate() + 1
//       );
//         await RefreshToken.create({
//           token: newRefreshToken,
//           userId: user.id,
//           expiryDate: expiredAt.getTime(),
//         });
//         res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite:"lax" });
//         req.cookies.refreshToken = newRefreshToken;
//       } else {
//         // access, refresh 둘 다 유효
//         const user = await User.findOne({
//           where: { origin:accessToken.origin},
//           attributes: ["id", "origin", "nickname", "profileImg", "statusMsg", "type"],
//           include: [{
//             model: Badge,
//             as: "MasterBadge",
//             attributes: ["id", "name"],
//           }],
//         })
//         if (!user) {
//           return res.status(400).json({ isSuccess: false, msg: "서버내부에러" });
//         }
//         res.locals.user = user;
//       }
//     }
//     next();
//     console.log(res.locals.user);
//   },
//   )
// };

// Authorization 적용 시
module.exports = {
  auth: async (req, res, next) => {
    const { authorization } = req.headers;
    if(!authorization) {
      return res.status(400).json({
        isSuccess: false,
        msg: "토큰 정보가 없습니다.",
      });
    };
    
    const [type, value] = authorization.split(" ");
    if(type !== "Bearer") {
      return res.status(400).json({
        isSuccess: false,
        msg: "유효하지 않은 타입의 토큰입니다.",
      });
    };

    if(!value) {
      return res.status(400).json({
        isSuccess: false,
        msg: "토큰이 없습니다.",
      });
    };

    try {
      const { origin } = jwt.verify(value, process.env.JWT_SECRET_KEY);

      const user = await User.findOne({
        where: { origin },
        attributes: ["id", "origin", "nickname", "profileImg", "statusMsg"],
        include: [{
          model: Badge,
          as: "MasterBadge",
          attributes: ["id", "name"],
        }],
      })
      if(!user) {
        return res.status(400).json({
          isSuccess: false,
          msg: "유효한 값의 토큰이 아닙니다."
        });
      };

      res.locals.user = user;
      next();
    } catch(error) {
      console.error(error);
      return res.status(500).json({
        isSuccess: false,
        msg: "Internal Server Error",
      });
    };
  },
};
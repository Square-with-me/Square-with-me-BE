// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge } = require("../models");


// RoomController for newBadge
const RoomController = require("./roomController");

// korean local time
const dateUtil = require("../utils/date");
const authController_notCookie = require("./authController_notCookie");

module.exports = {
  create: {},

  update: {
    profileImg: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { profileImg } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        profileImg,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          profileImg: profileImg,
        },
      });
    }),

    nickname: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { nickname } = req.body;

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

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        nickname,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          nickname,
        },
      });
    }),

    statusMsg: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const { statusMsg } = req.body;

      if (statusMsg.length < 1 || statusMsg.length > 20) {
        return res.status(400).json({
          isSuccess: false,
          msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요.",
        });
      }

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        statusMsg,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          statusMsg,
        },
      });
    }),

    masterBadge: asyncWrapper(async (req, res) => {
      const { id: userId } = res.locals.user;
      const { badgeId } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        masterBadgeId: badgeId,
      });
      const myMasterBadge = await Badge.findOne({
        where: { id: badgeId },
      });
      const imageUrl = await myMasterBadge.imageUrl;

      return res.status(200).json({
        isSuccess: true,
        data: imageUrl,
      });
    }),
  },

  get: {
    user: asyncWrapper(async (req, res) => {
      const { user } = res.locals;

      return res.status(200).json({
        isSuccess: true,
        data: {
          user,
        },
      });
    }),

    // 보유한 뱃지 정보 가져오기
    badges: asyncWrapper(async (req, res) => {
      const { user } = res.locals;

      const badges = await user.getMyBadges({
        attributes: ["id", "name", "imageUrl"],
      });
      

      const newBadge = RoomController.delete.newBadge();
      const newBadgeFirstCome = authController_notCookie.get.newBadge();

      console.log(newBadge, "newBadge-------");
      console.log(newBadgeFirstCome, "newBadgeFirstCome--------");

      if (newBadge !== 0 || newBadgeFirstCome !== 0) {
        res.status(200).json({
          isSuccess: true,
          data: badges,
          newBadge: { newBadge, newBadgeFirstCome }
        });

        RoomController.delete.newBadgeInit();
        authController_notCookie.get.newBadgeInit();
      } else {
        res.status(200).json({
          isSuccess: true,
          data: badges,
        });
      }
    }),

    records: asyncWrapper(async (req, res) => {
      const { id } = res.locals.user;

      // 네모와 함께한 시간 주간, 월간 기록 가져오기

      // <주간 기록>
      const weekdaysRecord = await dateUtil.weekRecordInitChecking(id, dateUtil.koreanDate)
      
      if (weekdaysRecord.msg) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      }

      // <월간 기록>
      const monthRecord = await dateUtil.monthRecordInitChecking(id, dateUtil.koreanDate)

      if (monthRecord.msg) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      }

      return res.status(200).json({
        isSuccess: true,
        data: {
          weekdaysRecord,
          monthRecord,
        },
      });
    }),
  },

  delete: {},
};

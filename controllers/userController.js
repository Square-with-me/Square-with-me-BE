// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge, WeekRecord, MonthRecord } = require("../models");

module.exports = {
  create: {

  },

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

      if(nickname.length < 2 || nickname.length > 8) {
        return res.status(400).json({
          isSuccess: false,
          msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요."
        });
      };

      if(!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다."
        });
      };

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

      if(statusMsg.length < 1 || statusMsg.length > 20) {
        return res.status(400).json({
          isSuccess: false,
          msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요."
        });
      };

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
      const { userId } = req.params;
      const { badgeId } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        MasterBadgeId: badgeId,
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          MasterBadgeId: badgeId,
        },
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
        }
      });
    }),
    
    // 보유한 뱃지 정보 가져오기는 아직 보류
    badges: asyncWrapper(async (req, res) => {
      const { userId } = res.params;

      return res.status(200).json({
        isSuccess: true,
        // data:
      });
    }),

    records: asyncWrapper(async (req, res) => {
      const { userId } = req.params;

      // 주간 기록 가져오기
      const weekRecord = await WeekRecord.findOne({
        where: { userId },
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      });

      // 월간 기록 가져오기
      const monthRecord = await MonthRecord.findAll({
        where: { userId },
        attributes: ["date", "time"],
        order: [ ["date"] ],
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          weekRecord,
          monthRecord,
        },
      });
    }),
  },

  delete: {

  },
};
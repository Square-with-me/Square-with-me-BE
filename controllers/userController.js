// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge } = require("../models");

// korean local time
const dateUtil = require("../utils/date");

module.exports = {
  create: {},
  giveBadge: {
    bug: asyncWrapper(async (req, res) => {
      const { userId } = req.params;
      const bugBadgeId = 8;  // 버그 뱃지 = 8

      const user = await User.findOne({
        where: { id: userId },
      });
      if(!user) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      };

      await user.addMyBadges(bugBadgeId);
      await user.update({ newBadge: bugBadgeId }); // 버그뱃지도 지급 시 뉴 뱃지로 추가

      return res.status(201).json({
        isSuccess: true,
        msg: "버그/리뷰 뱃지 지급 성공"
      });
    }),
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
          profileImg,
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
      };

      if (!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다.",
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

      if (statusMsg.length < 1 || statusMsg.length > 20) {
        return res.status(400).json({
          isSuccess: false,
          msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요.",
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
      const { id: userId } = res.locals.user;
      const { badgeId } = req.body;

      const user = await User.findOne({
        where: { id: userId },
      });

      await user.update({
        masterBadgeId: badgeId,
      });
      const badge = await Badge.findOne({
        where: { id: badgeId },
        attributes: ["id", "name", "imageUrl"]
      });

      return res.status(200).json({
        isSuccess: true,
        data: badge,
      });
    }),
  },

  get: {
    users: asyncWrapper(async (req, res) => {
      const users = await User.findAll({
        order: [["origin"]],
      });

      return res.status(200).json({
        isSuccess: true,
        data: {
          users,
        },
      });
    }),

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
      
      // newBadge가 있으면 숫자, 없으면 null 값임
      const newBadge =  await User.findOne({
        where: {
          id: user.id
        },
        attributes: ["newBadge"]
      })
      
      // newBadge 가 있는 경우
      if (newBadge.dataValues.newBadge !== null ) {

        res.status(200).json({
          isSuccess: true,
          data: badges,
          newBadge: newBadge.dataValues.newBadge
        });

        // 값 넘겨주고 나서 해당 유저의 newBadge 칼럼 초기화
        await User.update({
          newBadge: null
        }, 
        {
          where: {
            id: user.id
        }})
        
      } else { // newBadge로 넘어온 것이 없는 경우
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
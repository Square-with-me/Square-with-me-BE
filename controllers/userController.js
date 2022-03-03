const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// utils
const { asyncWrapper, regex } = require("../utils/util");

// models
const { User, Badge } = require("../models");

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
    auth: asyncWrapper(async (req, res) => {
      const { origin, pwd } = req.body;

      if(!origin || !pwd) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 입력하세요.",
        });
      };

      const user = await User.findOne({
        where: { origin },
      });
      if(!user) {
        return res.status(400).json({
          isSuccess: false,
          msg: "존재하지 않는 이메일입니다.",
        });
      };

      const pwdCheck = bcrypt.compareSync(pwd, user.pwd);
      if(!pwdCheck) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 틀렸습니다.",
        });
      };

      const fullUser = await User.findOne({
        where: {
          origin,
          type: "local",
        },
        attributes: ["id", "origin", "nickname", "profileImg", "statusMsg"],
        include: [{
          model: Badge,
          as: "MasterBadge",
          attributes: ["id", "name"],
        }],
      });
      const token = jwt.sign({ origin }, process.env.JWT_SECRET_KEY);

      return res.status(200).json({
        isSuccess: true,
        data: {
          token,
          user: fullUser,
        },
      });
    }),

    user: asyncWrapper(async (req, res) => {
      const { user } = res.locals;

      return res.status(200).json({
        isSuccess: true,
        data: {
          user,
        }
      });
    }),
  },

  delete: {

  },
};
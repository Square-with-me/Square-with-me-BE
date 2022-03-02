const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// utils
const { asyncWrapper } = require("../utils/util");

// models
const { User, Badge } = require("../models");

module.exports = {
  create: {

  },

  update: {

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
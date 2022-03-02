const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// utils
const { regex, asyncWrapper, createStatusMsg } = require("../utils/util");

// models
const { User, Badge } = require("../models");

module.exports = {
  create: {
    auth: asyncWrapper(async (req, res) => {
      const { email, nickname, pwd } = req.body;
      
      if(pwd.length <= 8) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 올바르지 않습니다.",
        });
      };

      if(!regex.checkEmail(email)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 형식이 올바르지 않습니다.",
        });
      };

      if(!regex.checkNickname(nickname)) {
        return res.status(400).json({
          isSuccess: false,
          msg: "닉네임에 특수문자를 사용할 수 없습니다.",
        });
      };

      const isExistEmail = await User.findOne({
        where: { email: email },
      });
      if(isExistEmail) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 이메일입니다.",
        });
      };

      const isExistNickname = await User.findOne({
        where: { nickname: nickname },
      });
      if(isExistNickname) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 닉네임입니다.",
        });
      };

      const hashedPwd = bcrypt.hashSync(pwd, 10);
      await User.create({
        email, nickname,
        pwd: hashedPwd,
        statusMsg: createStatusMsg(),
      });

      return res.status(201).json({
        isSuccess: true,
        msg: "회원가입에 성공하였습니다.",
      });
    }),
  },

  update: {

  },

  get: {
    auth: asyncWrapper(async (req, res) => {
      const { email, pwd } = req.body;

      if(!email || !pwd) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이메일 혹은 비밀번호를 입력하세요.",
        });
      };

      const user = await User.findOne({
        where: { email },
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
        where: { email },
        attributes: ["id", "email", "nickname", "statusMsg"],
        include: [{
          model: Badge,
          as: "MasterBadge",
          attributes: ["id", "name"],
        }],
      });
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);

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
      })
    }),
  },

  delete: {

  },
};
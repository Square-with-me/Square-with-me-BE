const { Op } = require("sequelize");

// models
const { 
  Room, Tag, Category, User, MonthRecord, Like, BeautyRecord, SportsRecord, StudyRecord, CounselingRecord, CultureRecord, ETCRecord
} = require("../models");

// utils
const { asyncWrapper, getDay } = require("../utils/util");

module.exports = {
  create: {
    room: asyncWrapper(async (req, res) => {
      const { id: userId } = res.locals.user;
      const { title, isSecret, pwd, categoryId, tags } = req.body;

      // 이미 존재하는 방 제목인지 확인
      const isExistTitle = await Room.findOne({
        where: { title },
      });
      if (isExistTitle) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 방 제목입니다.",
        });
      }

      // 방 생성
      const newRoom = await Room.create({
        title,
        isSecret,
        pwd,
        categoryId,
        masterUserId: userId,
        participantCnt: 1,
      });

      // tags 배열 돌면서 없는 태그는 생성
      const result = await Promise.all(
        tags.map((tag) =>
          Tag.findOrCreate({
            where: { name: tag },
          })
        )
      );
      await newRoom.addTags(result.map((v) => v[0]));

      // 참가자 추가
      await newRoom.addParticipants(userId);

      const fullRoom = await Room.findOne({
        where: { id: newRoom.id },
        attributes: ["id", "title", "isSecret", "masterUserId", "likeCnt", "participantCnt"],
        include: [{
          model: Category,
          attributes: ["id", "name"],
        }, {
          model: Tag,
          as: "Tags",
          attributes: ["id", "name"],
          through: { attributes: [] },
        }, {
          model: User,
          as: "Participants",
          attributes: ["id", "nickname", "masterBadgeId"],
          through: { attributes: [] },
        }],
      });

      return res.status(201).json({
        isSuccess: true,
        data: fullRoom,
      });
    }),

    participant: asyncWrapper(async (req, res) => {
      const { roomId, userId } = req.params;

      // roomId로 방 찾기
      const room = await Room.findOne({
        where: { id: roomId },
        attributes: ["id", "title", "isSecret", "masterUserId", "likeCnt", "participantCnt"],
        include: [{
          model: Category,
          attributes: ["id", "name"],
        }, {
          model: Tag,
          as: "Tags",
          attributes: ["id", "name"],
          through: { attributes: [] },
        }, {
          model: User,
          as: "Participants",
          attributes: ["id", "nickname", "masterBadgeId"],
          through: { attributes: [] },
        }],
      });

      // 현재 참가자 수 확인
      if(room.participantCnt >= 4) {
        return res.status(400).json({
          isSuccess: false,
          msg: "인원이 모두 찼습니다.",
        });
      };

      // 참가자 추가
      await room.addParticipants(userId);
      // 참가자 수 + 1
      await room.increment("participantCnt"); 
        
      res.status(201).json({
        isSuccess: true,
        data: room,
      });
    }),

    like: asyncWrapper(async (req, res) => {
      const { roomId } = req.params;
      const { id: userId } = res.locals.user;

      const [like, isFirst] = await Like.findOrCreate({
        // 좋아요 목록에 없으면 생성
        where: {
          roomId: roomId,
          likedId: userId,
        },
        defaults: {
          likedId: userId,
        },
      });
      if (!isFirst) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 좋아요를 눌렀습니다.",
        });
      }

      const room = await Room.findOne({
        where: { id: roomId },
      });

      await room.increment("likeCnt"); // 좋아요 수 +1

      return res.status(201).json({
        isSuccess: true,
        data: {
          isLiking: true,
          likeCnt: room.likeCnt + 1,
        },
      });
    }),
  },

  update: {},

  get: {
    rooms: asyncWrapper(async (req, res) => {
      const { q: query, p: page } = req.query;

      let offset = 0;
      if(page > 1) {
        offset = 8 * (page - 1);
      };

      let rooms = [];
      switch(query) {
        case "hot":  // 인기 방 목록 가져오기
          rooms = await Room.findAll({
            attributes: ["id", "title", "isSecret", "createdAt", "likeCnt", "participantCnt"],
            include: [{
              model: Category,
              attributes: ["id", "name"],
            }, {
              model: Tag,
              as: "Tags",
              attributes: ["id", "name"],
              through: { attributes: [] },
            }],
            order: [ ["likeCnt", "desc"] ],
            limit: 3,
          });
          break;

        case "all":
          // 전체 방 목록 가져오기
          rooms = await Room.findAll({
            offset: offset,
            limit: 8,
            attributes: ["id", "title", "isSecret", "createdAt", "likeCnt", "participantCnt"],
            include: [{
              model: Category,
              attributes: ["id", "name"],
            }, {
              model: Tag,
              as: "Tags",
              attributes: ["id", "name"],
              through: { attributes: [] },
            }],
            order: [ ["createdAt", "desc"] ],
          });
          break;

        case "possible":  // 입장 가능한 방 목록 가져오기
          rooms = await Room.findAll({
            where: {
              [Op.and]: [
                { participantCnt: { [Op.lte]: 3 } },
                { isSecret: false, },
              ],
            },
            offset: offset,
            limit: 8,
            attributes: ["id", "title", "isSecret", "createdAt", "likeCnt", "participantCnt"],
            include: [{
              model: Category,
              attributes: ["id", "name"],
            }, {
              model: Tag,
              as: "Tags",
              attributes: ["id", "name"],
              through: { attributes: [] },
            }],
            order: [ ["createdAt", "desc"] ],
          })
          break;

        default:  // 검색어로 검색하는 경우 => 비슷한 방 제목 목록 가져오기
          rooms = await Room.findAll({
            where: {
              title: { [Op.like]: `%${query}%` },
            },
            offset: offset,
            limit: 8,
            attributes: ["id", "title", "isSecret", "createdAt", "likeCnt", "participantCnt"],
            include: [{
              model: Category,
              attributes: ["id", "name"],
            }, {
              model: Tag,
              as: "Tags",
              attributes: ["id", "name"],
              through: { attributes: [] },
            }],
            order: [ ["createdAt", "desc"] ],
          });
          break;
      };

      return res.status(200).json({
        isSuccess: true,
        data: rooms,
      })
    }),

    categoryRooms: asyncWrapper(async (req, res) => {
      const { categoryId } = req.params;
      const { p: page } = req.query;

      let offset = 0;
      if(page > 1) {
        offset = 8 * (page - 1);
      };
      
      // categoryId로 방 검색해서 가져오기
      const rooms = await Room.findAll({
        where: { categoryId },
        offset: offset,
        limit: 8,
        attributes: ["id", "title", "isSecret", "createdAt", "likeCnt", "participantCnt"],
        include: [{
          model: Category,
          attributes: ["id", "name"],
        }, {
          model: Tag,
          as: "Tags",
          attributes: ["id", "name"],
          through: { attributes: [] },
        }],
        order: [ ["createdAt", "desc"] ],
      });

      return res.status(200).json({
        isSuccess: true,
        data: rooms,
      });
    }),

    pwd: asyncWrapper(async (req, res) => {
      const { roomId, pwd } = req.params;

      const room = await Room.findOne({
        where: { id: roomId },
      });
      const pwdCheck = room.pwd === pwd;
      if(!pwdCheck) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 일치하지 않습니다.",
        });
      }
      return res.status(200).json({
        isSuccess: true
      });
    }),
  },

  delete: {
    participant: async (data) => {
      const { roomId, userId, time, categoryId, date} = data;

      const room = await Room.findOne({
        where: { id: roomId },
      });
      if(!room) {
        return {
          isSuccess: false,
          msg: "존재하지 않는 방 정보입니다.",
        };
      };
      // 날짜로 요일 가져오기
      const day = getDay(date);
      console.log("유저 아이디", userId, "요일", day)
      // 일주일 기록 테이블의 요일과 카테고리에 시간 기록
      let preRecord = null;

      const updateOption = {};
      switch(categoryId) {  // 카테고리에 따라 시간 업데이트
        case 1:
          preRecord = await BeautyRecord.findOne({
            where: { userId },
          });

          updateOption[day] = preRecord[day] + time;

          await preRecord.update(updateOption);
          break;
        case 2:
          preRecord = await SportsRecord.findOne({
            where: { userId },
          });
          
          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 3:
          preRecord = await StudyRecord.findOne({
            where: { userId },
          });
          
          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 4:
          preRecord = await CounselingRecord.findOne({
            where: { userId },
          });

          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 5:
          preRecord = await CultureRecord.findOne({
            where: { userId },
          });
          
          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 6:
          preRecord = await ETCRecord.findOne({
            where: { userId },
          });
          
          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        default:
          break;
      }
      
      // 한달 기록 테이블에 시간 기록
      const preMonthRecord = await MonthRecord.findOne({
        where: {
          userId,
          date,
        },
      });
      await preMonthRecord.update({
        time: preMonthRecord.time + time,
      });

      // 방장인지 확인
      const isMasterUser = userId === room.masterUserId;
      switch(isMasterUser) {
     
        case true:
          const participants = await room.getParticipants({
            order: [["createdAt"]],
          });
          if(participants.length > 1) {  // 남은 인원 2명 이상이면 다음으로 들어온 사람한테 방장 넘기기
            await room.update({
              masterUserId: participants[1].id,
            });
          }

          await room.removeParticipants(userId);  // 나 자신은 참가자에서 없애기
          await room.decrement("participantCnt");
          break;

        case false:
          await room.removeParticipants(userId); // 참가자에서 없애기
          await room.decrement("participantCnt");
          break;

        default:
          break;
      }

      // 남은 참가자 확인하고 0명이면 방 삭제
      const left = await room.getParticipants();
      if (left.length === 0) {
        await Room.destroy({
          where: { id: roomId },
        });
      }

      return {
        isSuccess: true,
      };
    },

    like: asyncWrapper(async (req, res) => {
      const { roomId } = req.params;
      const { id: userId } = res.locals.user;

      const isLiking = await Like.findOne({
        where: {
          roomId,
          likedId: userId,
        },
      });
      if (!isLiking) {
        return res.status(400).json({
          isSuccess: false,
          msg: "좋아요를 하지 않은 상태입니다.",
        });
      }

      await Like.destroy({
        where: {
          roomId,
          likedId: userId,
        },
      });

      const room = await Room.findOne({
        where: { id: roomId },
      });
      await room.decrement("likeCnt");

      return res.status(200).json({
        isSuccess: true,
        data: {
          isLiking: false,
          likeCnt: room.likeCnt - 1,
        },
      });
    }),
  },
};

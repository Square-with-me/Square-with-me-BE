const { Op } = require("sequelize");

// models
const { Room, Tag, Category, User, Viewer, WeekRecord, MonthRecord, Like } = require("../models");

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
      if(isExistTitle) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 존재하는 방 제목입니다.",
        });
      };

      // 방 생성
      const newRoom = await Room.create({
        title,
        isSecret,
        pwd,
        categoryId,
        masterUserId: userId,
      });

      // tags 배열 돌면서 없는 태그는 생성
      const result = await Promise.all(tags.map((tag) => Tag.findOrCreate({
        where: { name: tag },
      })));
      await newRoom.addTags(result.map(v => v[0]));

      // 참가자 추가
      await newRoom.addParticipants(userId);

      const fullRoom = await Room.findOne({
        where: { id: newRoom.id },
        attributes: ["id", "title", "isSecret", "pwd", "masterUserId", "likeCnt"],
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
      const { role } = req.body;

      // roomId로 방 찾기
      const room = await Room.findOne({
        where: { id: roomId },
      });

      // role에 따라서
      switch(role) {
        case "participant":
          // 현재 참가자 수 확인
          const participants = await room.getParticipants();
          if(participants.length >= 4) {
            return res.status(400).json({
              isSuccess: false,
              msg: "인원이 모두 찼습니다.",
            });
          };
        
          // 참가자 추가
          await room.addParticipants(userId);
        
          res.status(201).json({
            isSuccess: true,
          });
          break;
          
        case "viewer":
          const viewers = await Viewer.findAll({
            where: { roomId, },
          });
          //  5명 초과인지 확인
          if(viewers.length > 5) {
            return res.status(400).json({
              isSuccess: false,
              msg: "인원이 모두 찼습니다.",
            });
          };

          // 뷰어로 추가
          await Viewer.create({
            userId,
            roomId,
          });

          res.status(200).json({
            isSuccess: true,
          })
          break;

        default:
          res.status(400).json({
            isSuccess: false,
            msg: "role이 전달되지 않았습니다.",
          });
          break;
      };
    }),

    like: asyncWrapper(async (req, res) => {
      const { roomId } = req.params;
      const { id: userId } = res.locals.user;

      const [like, isFirst] = await Like.findOrCreate({  // 좋아요 목록에 없으면 생성
        where: {
          roomId: roomId,
          likedId: userId,
        },
        defaults: {
          likedId: userId,
        }
      });
      if(!isFirst) {
        return res.status(400).json({
          isSuccess: false,
          msg: "이미 좋아요를 눌렀습니다.",
        });
      };

      const room = await Room.findOne({
        where: { id: roomId },
      });

      await room.increment("likeCnt");  // 좋아요 수 +1

      return res.status(201).json({
        isSuccess: true,
        data: {
          isLiking: true,
          likeCnt: room.likeCnt + 1, 
        }
      })
    }),
  },

  update: {

  },

  get: {
    rooms: asyncWrapper(async (req, res) => {
      const { q: query } = req.query;

      switch(query) {
        case "hot":  // 인기 방 목록 가져오기
          const hotRooms = await Room.findAll({
            attributes: ["id", "title", "isSecret", "pwd", "createdAt", "likeCnt"],
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
          });

          res.status(200).json({
            isSuccess: true,
            data: hotRooms,
          })
          break;

        case "all":
          // 전체 방 목록 가져오기
          const wholeRooms = await Room.findAll({
            attributes: ["id", "title", "isSecret", "pwd", "createdAt", "likeCnt"],
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
          
          res.status(200).json({
            isSuccess: true,
            data: wholeRooms,
          });
          break;

        default:
          // 검색어로 검색하는 경우
          // 비슷한 방 제목 목록 가져오기
          const rooms = await Room.findAll({
            where: {
              title: { [Op.like]: `%${query}%` }
            },
            attributes: ["id", "title", "isSecret", "pwd", "createdAt", "likeCnt"],
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
          res.status(200).json({
            isSuccess: true,
            data: rooms,
          });
          break;
      };
    }),
    
    categoryRooms: asyncWrapper(async (req, res) => {
      const { categoryId } = req.params;
      
      // categoryId로 방 검색해서 가져오기
      const rooms = await Room.findAll({
        where: { categoryId },
        attributes: ["id", "title", "isSecret", "pwd", "createdAt", "likeCnt"],
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
  },

  delete: {
    participant: asyncWrapper(async (req, res) => {
      const { roomId, userId } = req.params;
      const { t: time, c: category, d: date, r: role } = req.query;

      // 관전자였을 경우
      if(role === "viewer") {
        await Viewer.destroy({
          where: {
            roomId,
            userId,
          },
        });
      };

      // roomId로 방 찾기
      const room = await Room.findOne({
        where: { id: roomId },
      });
      if(!room) {
        return res.status(400).json({
          isSuccess: false,
          msg: "존재하지 않는 방입니다.",
        });
      };

      // 일주일 기록 테이블의 요일과 카테고리에 시간 기록
      const day = getDay(date);
      const preWeekRecords = await WeekRecord.findOne({
        where: { userId },
      });
      const newWeekRecord = {};
      newWeekRecord[day] = preWeekRecords[day] + Number(time);
      newWeekRecord[category] = preWeekRecords[category] + Number(time);

      await preWeekRecords.update(newWeekRecord);

      // 한달 기록 테이블에 시간 기록
      const preMonthRecords = await MonthRecord.findOne({
        where: {
          userId,
          date,
        },
      });
      await preMonthRecords.update({
        time: preMonthRecords.time + Number(time),
      });

      // 방장인지 확인하고 맞으면 다음사람한테 방장 넘기기
      const isMasterUser = Number(userId) === room.masterUserId;
      switch(isMasterUser) {
        case true:
          const participants = await room.getParticipants({
            order: [ ["createdAt"] ],
          });
          // 남은 인원 확인하고 2명 이상이면 방장 넘김
          if(participants.length > 1) {
            await room.update({
              masterUserId: participants[1].id,
            });
          };

          room.removeParticipants(userId);
          break;

        case false:
          room.removeParticipants(userId);
          break;

        default:
          res.status(400).json({
            isSuccess: false,
            msg: "들어오는건 자유지만 나가는건 아니란다."
          });
          break;
      };

      // 남은 참가자 확인
      const left = await room.getParticipants();
      if(left.length === 0) {
        await Room.destroy({
          where: { id: roomId },
        });
      };

      res.status(200).json({
        isSuccess: true,
      });
    }),

    like: asyncWrapper(async (req, res) => {
      const { roomId } = req.params;
      const { id: userId } = res.locals.user;

      const isLiking = await Like.findOne({
        where: {
          roomId,
          likedId: userId,
        },
      });
      if(!isLiking) {
        return res.status(400).json({
          isSuccess: false,
          msg: "좋아요를 하지 않은 상태입니다.",
        });
      };

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
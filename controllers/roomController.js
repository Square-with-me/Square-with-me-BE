const { Op } = require("sequelize");

// models

// 원래코드

// const {
//   Room,
//   Tag,
//   Category,
//   User,
//   Viewer,
//   // MonthRecord,
//   Like,
//   SportsRecord,
//   StudyRecord,
//   CounselingRecord,
//   CultureRecord,
//   ETCRecord,
// } = require("../models");


const { Room, Tag, Category, User, Viewer, Like } = require("../models");

// Mongo DB 시간기록
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");

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
        attributes: [
          "id",
          "title",
          "isSecret",
          "masterUserId",
          "likeCnt",
          "participantCnt",
        ],
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Tag,
            as: "Tags",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
          {
            model: User,
            as: "Participants",
            attributes: ["id", "nickname", "masterBadgeId"],
            through: { attributes: [] },
          },
        ],
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
        attributes: [
          "id",
          "title",
          "isSecret",
          "masterUserId",
          "likeCnt",
          "participantCnt",
        ],
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Tag,
            as: "Tags",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
          {
            model: User,
            as: "Participants",
            attributes: ["id", "nickname", "masterBadgeId"],
            through: { attributes: [] },
          },
        ],
      });

      // 현재 참가자 수 확인
      if (room.participantCnt >= 4) {
        return res.status(400).json({
          isSuccess: false,
          msg: "인원이 모두 찼습니다.",
        });
      }

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
      switch (query) {
        case "hot": // 인기 방 목록 가져오기
          rooms = await Room.findAll({
            attributes: [
              "id",
              "title",
              "isSecret",
              "createdAt",
              "likeCnt",
              "participantCnt",
            ],
            include: [
              {
                model: Category,
                attributes: ["id", "name"],
              },
              {
                model: Tag,
                as: "Tags",
                attributes: ["id", "name"],
                through: { attributes: [] },
              },
            ],
            order: [["likeCnt", "desc"]],
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

        case "possible": // 입장 가능한 방 목록 가져오기
          rooms = await Room.findAll({
            where: {
              [Op.and]: [
                { participantCnt: { [Op.lte]: 3 } },
                { isSecret: false },
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

        default:
          // 검색어로 검색하는 경우 => 비슷한 방 제목 목록 가져오기
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
      }

      return res.status(200).json({
        isSuccess: true,
        data: rooms,
      });
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
      if (!pwdCheck) {
        return res.status(400).json({
          isSuccess: false,
          msg: "비밀번호가 일치하지 않습니다.",
        });
      }
      return res.status(200).json({
        isSuccess: true,
      });
    }),
  },

  delete: {
    participant: async (data) => {
      console.log("controller 왔음", data);
      const { roomId, userId, time, categoryId, date } = data;

      // 특정 카테고리 이름 가져오기
      const theCategory = await Category.findOne({
        where: {
          id: categoryId,
        },
      });
      const category = theCategory.name;

      const room = await Room.findOne({
        where: { id: roomId },
      });
      if (!room) {
        return {
          isSuccess: false,
          msg: "존재하지 않는 방 정보입니다.",
        };
      }
      // 날짜로 요일 가져오기
      const day = getDay(date);
      console.log("유저 아이디", userId, "요일", day);
      // 일주일 기록 테이블의 요일과 카테고리에 시간 기록
      let preRecord = null;

      const updateOption = {};
      switch (
        categoryId // 카테고리에 따라 시간 업데이트
      ) {
        case 1:
          preRecord = await WeekRecord.findOne({
            // where: { userId },
            userId,
            category: "beauty"
          });

          updateOption[day] = preRecord[day] + time;

          await preRecord.update(updateOption);
          break;
        case 2:
          preRecord = await WeekRecord.findOne({
            userId,
            category: "sports"
          });

          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 3:
          preRecord = await WeekRecord.findOne({
            userId,
            category: "study"
          });

          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 4:
          preRecord = await WeekRecord.findOne({
            userId,
            category: "counseling"
          });

          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 5:
          preRecord = await WeekRecord.findOne({
            userId,
            category: "culture"
          });

          updateOption[day] = preRecord[day] + time;
          await preRecord.update(updateOption);
          break;
        case 6:
          preRecord = await WeekRecord.findOne({
            userId,
            category: "etc"
          });

          updateOption[day] = preRecord[day] + time;
          await preRecord.updateOne(updateOption);
          break;
        default:
          break;
      }

      // 한달 기록 테이블에 시간 기록
      const preMonthRecord = await MonthRecord.findOne({
          userId,
          date,
      });
      await preMonthRecord.updateOne({
        time: preMonthRecord.time + time,
      });

      // *****ch: 시간과 관련된 뱃지들 지급*****

      // 특정 유저의 특정 카테고리 기록 찾기
      const userRecords = await WeekRecord.findOne({
          userId,
          category: category
      });

      // 특정 유저의 특정 분야의 시간 총합
      const categoryTotalTime = userRecords.mon + userRecords.tue + userRecords.wed + userRecords.thur + userRecords.fri + userRecords.sat + userRecords.sun

      // 유저가 누군지 지정해주기
      const thatUser = await User.findOne({
        where: {
          userId,
        },
      });

      /*
      ch: 예시로 각각 카테고리별 시간 100시간 이상일 떄 해당 뱃지 지급한다고 가정,
      기준 추후에 달라지면 각각 설정하기 위해 if (100 <= categoryTotalTime 이 구문 각각의 if 절에 넣어줌
      */

      // 뱃지 카테고리 종류별로 가져오기 beauty, study, sports, counsel, culture, etc
      const theBadge = [];

      if (category === "beauty") {
        // Badge 테이블에 등록된 해당 뱃지 가져와야 함
        theBadge = await Badge.findOne({
          where: {
            name: "beauty", // 해당 뱃지 이름이나 id로 찾아야 함
          },
        });

        // 그 특정 유저의 뱃지 리스트를 가져옴, user 모델에서 MyBadges로 정의된 상태
        const isGivenBadge = await thatUser.getMyBadges({
          where: {
            badgeId: theBadge.id,
          },
        });
        if (100 <= categoryTotalTime && !isGivenBadge) {
          // 해당 카테고리 기준을 충족하고 해당 뱃지가 해당 유저에게 없을 경우 그 유저에게 뱃지 추가
          await thatUser.addMyBadges(theBadge.id);
        }
      } else if (category === "study") {
        theBadge = await Badge.findOne({
          where: {
            name: "study",
          },
        });

        const isGivenBadge = await thatUser.getMyBadges({
          where: {
            badgeId: theBadge.id,
          },
        });
        if (100 <= categoryTotalTime && !isGivenBadge) {
          await thatUser.addMyBadges(theBadge.id);
        }
      } else if (category === "sports") {
        theBadge = await Badge.findOne({
          where: {
            name: "sports",
          },
        });

        const isGivenBadge = await thatUser.getMyBadges({
          where: {
            badgeId: theBadge.id,
          },
        });
        if (100 <= categoryTotalTime && !isGivenBadge) {
          await thatUser.addMyBadges(theBadge.id);
        }
      } else if (category === "counsel") {
        theBadge = await Badge.findOne({
          where: {
            name: "counsel",
          },
        });

        const isGivenBadge = await thatUser.getMyBadges({
          where: {
            badgeId: theBadge.id,
          },
        });
        if (100 <= categoryTotalTime && !isGivenBadge) {
          await thatUser.addMyBadges(theBadge.id);
        }
      } else if (category === "culture") {
        theBadge = await Badge.findOne({
          where: {
            name: "culture",
          },
        });

        const isGivenBadge = await thatUser.getMyBadges({
          where: {
            badgeId: theBadge.id,
          },
        });
        if (100 <= categoryTotalTime && !isGivenBadge) {
          await thatUser.addMyBadges(theBadge.id);
        }
      } else {
        theBadge = await Badge.findOne({
          where: {
            name: "etc",
          },
        });

        const isGivenBadge = await thatUser.getMyBadges({
          where: {
            badgeId: theBadge.id,
          },
        });
        if (100 <= categoryTotalTime && !isGivenBadge) {
          await thatUser.addMyBadges(theBadge.id);
        }
      }

      // 방장인지 확인
      const isMasterUser = userId === room.masterUserId;
      switch (isMasterUser) {
        case true:
          const participants = await room.getParticipants({
            order: [["createdAt"]],
          });
          if (participants.length > 1) {
            // 남은 인원 2명 이상이면 다음으로 들어온 사람한테 방장 넘기기
            await room.update({
              masterUserId: participants[1].id,
            });
          }

          await room.removeParticipants(userId); // 나 자신은 참가자에서 없애기
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

      // 리턴 전 특정 유저가 뱃지를 획득했는지 확인, 있을 경우 이미지 Url 지급
      const userHasBadge = await thatUser.getMyBadges({
        where: {
          badgeId: theBadge.id,
        },
      });
      if (userHasBadge) {
        return {
          isSuccess: true,
          category: category, // ch: 어떤 뱃지를 주어야하는지 알려주기 위해 같이 전달
          imageUrl: theBadge.imageUrl, // ch: 뱃지가 있을 경우 여기다가 반환해줄 S3 이미지 링크 넣어서 같이 반환해주기// 이미 url 링크 지급한 적 있으면 보내지 않게 하기는 추후 고민
        };
      } else {
        return {
          isSuccess: true,
        };
      }
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

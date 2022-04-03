const { Op } = require("sequelize");

// MySQL models
const { Room, Tag, Category, User, Like, Badge } = require("../models");

// Mongo collections
const WeekRecord = require("../mongoSchemas/weekRecord");
const MonthRecord = require("../mongoSchemas/monthRecord");
const Log = require("../mongoSchemas/log");

// utils
const { asyncWrapper, getDay } = require("../utils/util");

// korean local time
const dateUtil = require("../utils/date");

const CATEGORY = {
  // 카테고리 목록
  뷰티: "beauty",
  운동: "sports",
  스터디: "study",
  상담: "counseling",
  문화: "culture",
  기타: "etc",
};
const CATEGORY_BADGE_CRITERIA = 60; // 카테고리 뱃지 지급 기준(단위 : 분)

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
      };

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

      const roomInfo = await Room.findOne({
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
      // 입장시 로그 기록
      const roomId = roomInfo.id
      const category = roomInfo.category.id;
      const entryTime = dateUtil.koreanDate();
      const roomTitle = roomInfo.title;

      console.log(roomInfo, "roomInfo는 이것이다!");
      console.log(roomTitle, "roomTitle은 이것이다!")
      
      const createLog = new Log({
        userId,
        entryTime,
        roomId,
        category,
        roomName: roomTitle,
      });
      await createLog.save();

      console.log(createLog, "createLog는 이것이다")
      return res.status(201).json({
        isSuccess: true,
        data: roomInfo,
      });
    }),

    participant: asyncWrapper(async (req, res) => {
      const { roomId, userId } = req.params;

      // roomId로 방 찾기
      const roomInfo = await Room.findOne({
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
      if (roomInfo.participantCnt >= 4) {
        return res.status(400).json({
          isSuccess: false,
          msg: "인원이 모두 찼습니다.",
        });
      }

      // 참가자 추가
      await roomInfo.addParticipants(userId);
      // 참가자 수 + 1
      await roomInfo.increment("participantCnt");

      // 입장시 로그 기록
      const category = roomInfo.category.id;
      const entryTime = dateUtil.koreanDate();
      const roomTitle = roomInfo.title;
      
      const createLog = new Log({
        userId,
        entryTime,
        roomId,
        category,
        roomName: roomTitle,
      });
      await createLog.save();

    
      res.status(201).json({
        isSuccess: true,
        data: roomInfo,
      });
      
    }),

    // like: asyncWrapper(async (req, res) => {
    //   const { roomId } = req.params;
    //   const { id: userId } = res.locals.user;

    //   const [like, isFirst] = await Like.findOrCreate({
    //     // 좋아요 목록에 없으면 생성
    //     where: {
    //       roomId: roomId,
    //       likedId: userId,
    //     },
    //     defaults: {
    //       likedId: userId,
    //     },
    //   });
    //   if (!isFirst) {
    //     return res.status(400).json({
    //       isSuccess: false,
    //       msg: "이미 좋아요를 눌렀습니다.",
    //     });
    //   }

    //   const room = await Room.findOne({
    //     where: { id: roomId },
    //   });

    //   await room.increment("likeCnt"); // 좋아요 수 +1

    //   return res.status(201).json({
    //     isSuccess: true,
    //     data: {
    //       isLiking: true,
    //       likeCnt: room.likeCnt + 1,
    //     },
    //   });
    // }),
  },

  update: {},

  get: {
    rooms: asyncWrapper(async (req, res) => {
      let { q: query, p: page } = req.query;
      let offset = 0;
      page /= 1  // 문자 => 숫자 변환

      // 처음에 방 7개만을 가지고 오기위해 만들어낸 수, 처음 이후론 8개씩 가져오기
      let roomSearchingLimit = 0

      if (page === 2) { // 처음에는 7개만 보내주니까 처음에는 7개만 상쇄(offset)
        offset = 7;
      }
      else if (page > 2) {
        offset = 7 + 8 * (page - 2);
      }

      page === 1
        ? roomSearchingLimit = 7  // 첫 페이지만 7개 리턴
        : roomSearchingLimit = 8

      let rooms = [];
      switch (query) {
        case "all":
          // 전체 방 목록 가져오기
          rooms = await Room.findAll({
            offset: offset,
            limit: roomSearchingLimit,
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
            order: [["createdAt", "desc"]],
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
            limit: roomSearchingLimit,
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
            order: [["createdAt", "desc"]],
          });
          break;

        default:

          
          //// 창훈 두 번째 시도
          // rooms = await Room.findAll({
          //     where: {
          //       [Op.or]: [
          //       {title: { [Op.like]: `%${query}%` }},
          //       // { "$Category.name$": {[Op.like]: `%${query}%`} },
          //       // { "$Tag.name$": {[Op.like]: `%${query}%`} },
          //       ],
          //     },
          //     offset: offset,
          //     limit: roomSearchingLimit,
          //     attributes: [
          //       "id",
          //       "title",
          //       "isSecret",
          //       "createdAt",
          //       "likeCnt",
          //       "participantCnt",
          //     ],
          //     include: [
          //       {
          //         model: Category,
          //         attributes: ["id", "name"],
          //         where: {
          //           [Op.or]: [ 
          //             {name: {[Op.like]: `%${query}%` }
          //           }
          //         ]}
          //       },
          //       {
          //         model: Tag,
          //         as: "Tags",
          //         attributes: ["id", "name"],
          //         through: { attributes: [] },
          //         where: {
          //           [Op.or]: [ 
          //             {name: {[Op.like]: `%${query}%` }
          //           }
          //         ]}
          //       },
          //     ],
          //     order: [["createdAt", "desc"]],
          //   });

          //   console.log("rooms를 콘솔에 찍으면 이렇게 나온다.", rooms, "rooms를 콘솔에 찍으면 이렇게 나온다.")



        // 창훈 첫번째 시도, 한 요소씩 찾아서 별도의 배열에 집어넣고 시간순으로 나열하여 반환하려했음, 시간 복잡도가 너무 클 것으로 예상 ex) 정렬을 위해 또다시 map, filter, includes같은 함수들을 써야할 것 같음
        // const searchingCategories = await Category.findAll({
        //   where: {
        //     name: { [Op.like]: `%${query}%` }},
        // })

        // // 예를 들어 '뷰티 운동' 이라고 입력하면 두 카테고리 모두 나와야 하는 것이 아닌지?

        // const searchingTags = await Tag.findAll({
        //   where: {
        //     name: { [Op.like]: `%${query}%` }},
        // },

        // )
        // // 관련된 모든 태그 모두 출동하려면?

        // // 해당되는 모든 방제목 검색

        // const searchingTitles = await Room.findAll({
        //   where: {
        //     title: { [Op.like]: `%${query}%` }},
        // })
        // // findAll 은 리스트형, 즉, 배열을 반환


        //   let searchingTitle
        //   let searchingTag
        //   let searchingTitle
          

        //   let rooms = []

        // // 제목이 들어맞는 방
        //   searchingRoomTitle.map( v => 
        //    searchingRoom = await Room.findOne({
        //       where: {
        //         title: `${v.title}`},
        //       // offset: offset,
        //       // limit: roomSearchingLimit,
        //       attributes: [
        //         "id",
        //         "title",
        //         "isSecret",
        //         "createdAt",
        //         "likeCnt",
        //         "participantCnt",
        //       ],
        //       include: [
        //         {
        //           model: Category,
        //           attributes: ["id", "name"],
        //         },
        //         {
        //           model: Tag,
        //           as: "Tags",
        //           attributes: ["id", "name"],
        //           through: { attributes: [] },
        //         },
        //       ],
        //       // order: [["createdAt", "desc"]],
        //     }),
        //     rooms. push(searchingRoom) // 찾은 결괏 값을 하나씩 여기에 넣어준다.

        //     )
         




          //// 원래 코드

          // 검색어로 검색하는 경우 => 비슷한 방 제목 목록 가져오기
          rooms = await Room.findAll({
            where: {
              [Op.or]: [
              {title: { [Op.like]: `%${query}%` }},
              // { "$Category.name$": {[Op.like]: `%${query}%`} },
              // { "$Tag.name$": {[Op.like]: `%${query}%`} },
              ],
            },
            offset: offset,
            limit: roomSearchingLimit,
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
            order: [["createdAt", "desc"]],
          });
          break;
      };

      return res.status(200).json({
        isSuccess: true,
        data: rooms,
      });
    }),

    categoryRooms: asyncWrapper(async (req, res) => {
      const { categoryId } = req.params;
      let { p: page } = req.query;
      let offset = 0;
      
      page /= 1; // 숫자로 변환

      // 처음에 방 7개만을 가지고 오기위해 만들어낸 수, 처음 이후론 8개씩 가져오기
      let roomSearchingLimit = 0

      if (page === 2) {
        offset = 7;
      }
      else if (page > 2) {
        offset = 7 + 8 * (page - 2);
      }
  
      page === 1
      ? roomSearchingLimit = 7
      : roomSearchingLimit = 8

      // categoryId로 방 검색해서 가져오기
      const rooms = await Room.findAll({
        where: { categoryId },
        offset: offset,
        limit: roomSearchingLimit,
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
        order: [["createdAt", "desc"]],
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
      };
      return res.status(200).json({
        isSuccess: true,
      });
    }),
  },

  delete: {
    participant: async (data) => {
      console.log("data", data);
      try {
        const { roomId, userId, time, categoryId, date } = data; // time: 분 단위, date: 방 입장 시점의 날짜

        const user = await User.findOne({
          where: {
            id: userId,
          },
        });

        // 특정 카테고리 이름 가져오기
        const category = await Category.findOne({
          where: {
            id: categoryId,
          },
        });
        const categoryName = category.name; // 카테고리명은 한글

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
        // 한국 시간 가져오기
        const checkingDate = dateUtil.koreanDate();

        // 월간 기록 초기화 Start
        let monthRecord = await MonthRecord.find(
          { userId: userId },
          { _id: 0, __v: 0 }
        );
        if (monthRecord.length === 0) {
          return res.status(400).json({
            isSuccess: false,
            msg: "일치하는 유저 정보가 없습니다.",
          });
        }

        const lastUpdatedMonth = monthRecord[0].lastUpdatedDate.getMonth() + 1; // 월간 기록의 최근 업데이트 된 달
        const checkingMonth = checkingDate.getMonth() + 1; // 이번 달

        if (
          lastUpdatedMonth !== checkingMonth || // 달이 다르거나
          monthRecord[0].lastUpdatedDate.getFullYear() !==
            checkingDate.getFullYear() // 연도가 다를 때
        ) {
          await MonthRecord.updateMany(
            { userId: userId },
            { $set: { time: 0, lastUpdatedDate: checkingDate } }
          );
          await MonthRecord.find({ userId: userId }, { _id: 0, __v: 0 });
        }
        // 월간 기록 초기화 End

        // 주간 기록 초기화 Start
        let weekdaysRecord = await WeekRecord.find(
          { userId: userId },
          { _id: 0, __v: 0 }
        );

        if (weekdaysRecord.length === 0) {
          return res.status(400).json({
            isSuccess: false,
            msg: "일치하는 유저 정보가 없습니다.",
          });
        }
        const lastUpdatedDate = user.lastUpdated;

        const oneDay = 86400000; //  Milliseconds for a day

        // 시간 상관없이 요일끼리만 비교하기 위해 모든 시간은 0으로 설정
        const lastUpdatedZeroHour = new Date(
          lastUpdatedDate.getFullYear(),
          lastUpdatedDate.getMonth(),
          lastUpdatedDate.getDate(),
          0
        );
        const checkingZeroHour = new Date(
          checkingDate.getFullYear(),
          checkingDate.getMonth(),
          checkingDate.getDate(),
          0
        );

        if (checkingZeroHour.getDay() === 0) {
          // 일요일
          if (
            lastUpdatedZeroHour <= checkingZeroHour - 7 * oneDay || // 주가 다를 때
            checkingZeroHour + 1 * oneDay <= lastUpdatedZeroHour
          ) {
            await User.update({ lastUpdated: checkingDate }, { where: { id } });

            await WeekRecord.updateMany(
              { userId: userId },
              {
                $set: {
                  mon: 0,
                  tue: 0,
                  wed: 0,
                  thur: 0,
                  fri: 0,
                  sat: 0,
                  sun: 0,
                },
              }
            );

            weekdaysRecord = await WeekRecord.find(
              { userId: id },
              { _id: 0, __v: 0 }
            );
          }
        } else {
          // 월요일 ~ 토요일
          if (
            lastUpdatedZeroHour <=
              checkingZeroHour - checkingZeroHour.getDay() * oneDay ||
            checkingZeroHour + (8 - checkingZeroHour.getDay()) * oneDay <=
              lastUpdatedZeroHour
          ) {
            await User.update({ lastUpdated: checkingDate }, { where: { id } });

            await WeekRecord.updateMany(
              { userId: userId },
              {
                $set: {
                  mon: 0,
                  tue: 0,
                  wed: 0,
                  thur: 0,
                  fri: 0,
                  sat: 0,
                  sun: 0,
                },
              }
            );

            weekdaysRecord = await WeekRecord.find(
              { userId: id },
              { _id: 0, __v: 0 }
            );
          }
        }
        // 주간 기록 초기화 End

        let preRecord = null;
        const badgeCategory = CATEGORY[categoryName];
        const categoryBadge = await Badge.findOne({
          // 해당 카테고리의 뱃지 가져오기
          where: {
            name: badgeCategory,
          },
        });

        const userCategoryBadge = await user.getMyBadges({
          // 유저의 카테고리 뱃지 소유 여부
          where: {
            id: categoryBadge.id,
          },
        });

        if (day === "sun") {
          // 일요일인 경우 '퇴장시간 저장 - 뱃지 지급 여부 판단 - 시간 초기화'
          // 주간 기록 저장
          const updateOption = {};
          switch (categoryId) {
            case 1:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "beauty",
              });

              console.log("뷰티 시간 저장아 되어랏, 일요일");
              updateOption[day] = preRecord[day] + time;

              await preRecord.update(updateOption);
              break;
            case 2:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "sports",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 3:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "study",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 4:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "counseling",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 5:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "culture",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 6:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "etc",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.updateOne(updateOption);
              break;
            default:
              break;
          }

          // 월간 기록 저장
          const preMonthRecord = await MonthRecord.findOne({ userId, date });
          await preMonthRecord.updateOne({
            time: preMonthRecord.time + time,
          });

          // 카테고리 뱃지 지급 여부 판단
          // 특정 유저의 특정 카테고리 기록 찾기
          const userRecords = await WeekRecord.findOne({
            userId,
            category: badgeCategory,
          });
          // 유저의 해당 카테고리의 시간 총합
          const categoryTotalTime =
            userRecords.mon +
            userRecords.tue +
            userRecords.wed +
            userRecords.thur +
            userRecords.fri +
            userRecords.sat +
            userRecords.sun;

          // 해당 카테고리 기준을 충족하고 해당 뱃지가 해당 유저에게 없을 경우 그 유저에게 뱃지 추가
          if (
            CATEGORY_BADGE_CRITERIA <= categoryTotalTime &&
            userCategoryBadge.length === 0
          ) {
            await user.addMyBadges(categoryBadge.id);
            await user.update({ newBadge: categoryBadge.id });
          }
        } else {
          // 월 ~ 토 인 경우, '퇴장 시간 저장 - 뱃지 지급 여부 판단'
          // 주간 기록 저장
          const updateOption = {};
          switch (categoryId) {
            case 1:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "beauty",
              });
              updateOption[day] = preRecord[day] + time;

              await preRecord.update(updateOption);
              break;
            case 2:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "sports",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 3:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "study",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 4:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "counseling",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 5:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "culture",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.update(updateOption);
              break;
            case 6:
              preRecord = await WeekRecord.findOne({
                userId,
                category: "etc",
              });

              updateOption[day] = preRecord[day] + time;
              await preRecord.updateOne(updateOption);
              break;
            default:
              break;
          };

          // 월간 기록 저장
          const preMonthRecord = await MonthRecord.findOne({ userId, date });
          await preMonthRecord.updateOne({
            time: preMonthRecord.time + time,
          });

          // 카테고리 뱃지 지급 여부 판단
          // 특정 유저의 특정 카테고리 기록 찾기
          const userRecords = await WeekRecord.findOne({
            userId,
            category: badgeCategory,
          });
          // 유저의 해당 카테고리의 시간 총합
          const categoryTotalTime =
            userRecords.mon +
            userRecords.tue +
            userRecords.wed +
            userRecords.thur +
            userRecords.fri +
            userRecords.sat +
            userRecords.sun;

          // 해당 카테고리 기준을 충족하고 해당 뱃지가 해당 유저에게 없을 경우 그 유저에게 뱃지 추가
          if (
            CATEGORY_BADGE_CRITERIA <= categoryTotalTime &&
            userCategoryBadge.length === 0
          ) {
            await user.addMyBadges(categoryBadge.id);
            await user.update({ newBadge: categoryBadge.id });
          }
        }

        // 퇴장시 로그 기록
        const exitTime = dateUtil.koreanDate();
        await Log.findOneAndUpdate({ userId, roomId }, { exitTime });

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
      } catch (error) {
        console.error(error);
      }
    },

    // like: asyncWrapper(async (req, res) => {
    //   const { roomId } = req.params;
    //   const { id: userId } = res.locals.user;

    //   const isLiking = await Like.findOne({
    //     where: {
    //       roomId,
    //       likedId: userId,
    //     },
    //   });
    //   if (!isLiking) {
    //     return res.status(400).json({
    //       isSuccess: false,
    //       msg: "좋아요를 하지 않은 상태입니다.",
    //     });
    //   }

    //   await Like.destroy({
    //     where: {
    //       roomId,
    //       likedId: userId,
    //     },
    //   });

    //   const room = await Room.findOne({
    //     where: { id: roomId },
    //   });
    //   await room.decrement("likeCnt");

    //   return res.status(200).json({
    //     isSuccess: true,
    //     data: {
    //       isLiking: false,
    //       likeCnt: room.likeCnt - 1,
    //     },
    //   });
    // }),
  },
};
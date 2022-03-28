const { Op } = require("sequelize");

// models

const { Room, Tag, Category, User, Viewer, Like, Badge } = require("../models");

// Mongo DB 시간기록
const WeekRecord = require("../mongoSchemas/weekRecord");


// utils
const { asyncWrapper, getDay } = require("../utils/util");
let newBadge = 0; // UserController에 전달될 newBadge 전역변수 저장

// korean local time
const timeRecord = require("../utils/date");
const krToday = timeRecord.koreanDate;


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
      if (page > 1) {
        offset = 8 * (page - 1);
      }

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
            limit: 8,
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
          // 검색어로 검색하는 경우 => 비슷한 방 제목 목록 가져오기
          rooms = await Room.findAll({
            where: {
              title: { [Op.like]: `%${query}%` },
            },
            offset: offset,
            limit: 8,
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
      if (page > 1) {
        offset = 8 * (page - 1);
      }

      // categoryId로 방 검색해서 가져오기
      const rooms = await Room.findAll({
        where: { categoryId },
        offset: offset,
        limit: 8,
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
      }
      return res.status(200).json({
        isSuccess: true,
      });
    }),
  },

  delete: {
    participant: async (data) => {
      try {
        // asyncWrapper는 http 요청에 맞춰진 것이므로 여기선 try catch 구문으로 에러 캐치

        const { roomId, userId, time, categoryId, date } = data; // 기존 코드는 받는 인자 data, 테스트 할 때는 req.body.data로 테스트, 썬더 클라이언트에서 body에 필요한 데이터 넣음
        // time은 분 단위로 넘어옴
        // date는 방 입장 시점을 나타냄

        // 특정 카테고리 이름 가져오기

        const theCategory = await Category.findOne({
          where: {
            id: categoryId,
          },
        });
        const category = theCategory.name; // 카테고리명은 한글

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
       
      // <월간기록>

        const monthRecordReturn = await timeRecord.monthRecordInitChecking(userId, krToday)

      if (monthRecordReturn.msg) {
        return res.status(400).json({
          isSuccess: false,
          msg: "일치하는 유저 정보가 없습니다.",
        });
      }



        // <주간기록> - 가져오기와 카테고리별 뱃지 지급

        /*
    월 ~ 토 까지 이용, 다음 수요일에 이용 시 방나갈 때 어느시점에 시간을 초기화 하여야 하나?
    1) 시간 기록 후, 뱃지 지급 전
    지급 전에 초기화하면 문제 없음, 일요일에 이용하다가 월요일 새벽에 나가게 될 때, 월화수목금토일의 시간을 일단 한번 계산해보고 기준 충족하면 뱃지를 지급하기는 해야함
    그러나 지난 주 월 ~ 토 까지 이용, 다음 수요일에 이용하는 경우 지난 주 기록을 초기화 한 다음 시간을 기록해야함

    -> ************** 방에 입장한 날이 일요일인 경우 '퇴장시간 저장 - 뱃지 지급 여부 판단 - 시간 초기화',
    일요일이 아니라 그다음 주 월 ~ 토 중 하나인 경우 '시간 초기화 - 퇴장 시간 저장 = 뱃지 지급 여부 판단' **************

    2) 시간 기록 후, 뱃지까지 지급 후
    일요일에 이용하다가 월요일 새벽에 나가는 경우 문제가 없음
    그러나 지난 주 월 ~ 토 까지 이용, 다음 수요일에 이용하는 경우 오늘 시간까지 기록하고 나서 지급해버리면 문제가 됨

    3) 시간 기록 전 초기화
    월 ~ 토 까지 이용, 다음 수요일에 이용 시 문제 없음, 일요일에 이용하다가 월요일 새벽에 나가게 될 때는 일요일 시간이 기록되고 뱃지지급여부 판단이 이뤄지지 않으므로 문제!

*/

        let preRecord = null;

        if (day === "sun") {
          // 방에 입장한 날이 일요일인 경우 '퇴장시간 저장 - 뱃지 지급 여부 판단 - 시간 초기화'

          //// <퇴장시간 저장>
          const updateOption = {};
          switch (
            categoryId // 카테고리에 따라 시간 업데이트
          ) {
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
          }

          // <뱃지 지급 여부 판단>

          // *****시간과 관련된 뱃지들 지급*****
          // 카테고리명은 한글, 뱃지 카테고리명은 영어, 둘 사이를 매치시켜주기 위함

          let badgeCategory = "";
          if (category === "뷰티") {
            badgeCategory = "beauty";
          } else if (category === "운동") {
            badgeCategory = "sports";
          } else if (category === "스터디") {
            badgeCategory = "study";
          } else if (category === "상담") {
            badgeCategory = "counseling";
          } else if (category === "문화") {
            badgeCategory = "culture";
          } else if (category === "기타") {
            badgeCategory = "etc";
          }

          // 특정 유저의 특정 카테고리 기록 찾기
          const userRecords = await WeekRecord.findOne({
            userId,
            category: badgeCategory,
          });

          // 특정 유저의 특정 분야의 시간 총합
          const categoryTotalTime =
            userRecords.mon +
            userRecords.tue +
            userRecords.wed +
            userRecords.thur +
            userRecords.fri +
            userRecords.sat +
            userRecords.sun;

          // 유저가 누군지 지정해주기
          const thatUser = await User.findOne({
            where: {
              id: userId,
            },
          });

          /*
      각각 카테고리별 시간 1시간 이상일 떄 해당 뱃지 지급하기로 함
      기준 추후에 달라지면 각각 설정하기 위해 if (60 <= categoryTotalTime 이 구문을 각각의 if 절에 넣어줌
      */

          // 뱃지 카테고리 종류별로 가져오기 beauty, study, sports, counseling, culture, etc
          let theBadge = [];

          if (badgeCategory === "beauty") {
            // Badge 테이블에 등록된 해당 뱃지 가져와야 함
            theBadge = await Badge.findOne({
              where: {
                name: "beauty",
              },
            });

            // 그 특정 유저의 뱃지 리스트를 가져옴, user 모델에서 MyBadges로 정의된 상태
            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });

            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              // 해당 카테고리 기준을 충족하고 해당 뱃지가 해당 유저에게 없을 경우 그 유저에게 뱃지 추가
              thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "study") {
            theBadge = await Badge.findOne({
              where: {
                name: "study",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "sports") {
            theBadge = await Badge.findOne({
              where: {
                name: "sports",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "counseling") {
            theBadge = await Badge.findOne({
              where: {
                name: "counseling",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "culture") {
            theBadge = await Badge.findOne({
              where: {
                name: "culture",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else {
            theBadge = await Badge.findOne({
              where: {
                name: "etc",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          }

          // <시간 초기화>


          const weekRecordReturn = await timeRecord.weekRecordInitChecking(id, krToday)
      
          if (weekRecordReturn.msg) {
            return res.status(400).json({
              isSuccess: false,
              msg: "일치하는 유저 정보가 없습니다.",
            });
          }

        } else {
          // 일요일이 아니라 그다음 주 월 ~ 토 중 하나인 경우 '시간 초기화 - 퇴장 시간 저장 - 뱃지 지급 여부 판단'

          // <시간 초기화>

          const weekRecordReturn = await timeRecord.weekRecordInitChecking(id, krToday)
      
          if (weekRecordReturn.msg) {
            return res.status(400).json({
              isSuccess: false,
              msg: "일치하는 유저 정보가 없습니다.",
            });
          }


          //// <퇴장시간 저장>
          const updateOption = {};
          switch (
            categoryId // 카테고리에 따라 시간 업데이트
          ) {
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
          }

          // <뱃지 지급 여부 판단>

          // *****시간과 관련된 뱃지들 지급*****
          // 카테고리명은 한글, 뱃지 카테고리명은 영어, 둘 사이를 매치시켜주기 위함

          let badgeCategory = "";
          if (category === "뷰티") {
            badgeCategory = "beauty";
          } else if (category === "운동") {
            badgeCategory = "sports";
          } else if (category === "스터디") {
            badgeCategory = "study";
          } else if (category === "상담") {
            badgeCategory = "counseling";
          } else if (category === "문화") {
            badgeCategory = "culture";
          } else if (category === "기타") {
            badgeCategory = "etc";
          }

          // 특정 유저의 특정 카테고리 기록 찾기
          const userRecords = await WeekRecord.findOne({
            userId,
            category: badgeCategory,
          });

          // 특정 유저의 특정 분야의 시간 총합
          const categoryTotalTime =
            userRecords.mon +
            userRecords.tue +
            userRecords.wed +
            userRecords.thur +
            userRecords.fri +
            userRecords.sat +
            userRecords.sun;

          // 유저가 누군지 지정해주기
          const thatUser = await User.findOne({
            where: {
              id: userId,
            },
          });

          // 뱃지 카테고리 종류별로 가져오기 beauty, study, sports, counseling, culture, etc
          let theBadge = [];

          if (badgeCategory === "beauty") {
            // Badge 테이블에 등록된 해당 뱃지 가져와야 함
            theBadge = await Badge.findOne({
              where: {
                name: "beauty",
              },
            });

            // 그 특정 유저의 뱃지 리스트를 가져옴, user 모델에서 MyBadges로 정의된 상태
            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });

            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              // 해당 카테고리 기준을 충족하고 해당 뱃지가 해당 유저에게 없을 경우 그 유저에게 뱃지 추가
              thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "study") {
            theBadge = await Badge.findOne({
              where: {
                name: "study",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "sports") {
            theBadge = await Badge.findOne({
              where: {
                name: "sports",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "counseling") {
            theBadge = await Badge.findOne({
              where: {
                name: "counseling",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else if (badgeCategory === "culture") {
            theBadge = await Badge.findOne({
              where: {
                name: "culture",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
          } else {
            theBadge = await Badge.findOne({
              where: {
                name: "etc",
              },
            });

            const isGivenBadge = await thatUser.getMyBadges({
              where: {
                id: theBadge.id,
              },
            });
            if (60 <= categoryTotalTime && isGivenBadge !== []) {
              await thatUser.addMyBadges(theBadge.id);
              newBadge = theBadge.id;
            }
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

      } catch (error) {
        console.error(error);
      }
    },

    // 새로운 뱃지가 지급되면 프론트로 한번 보내주고 초기화

    newBadge: async () => {
      console.log(newBadge, "일단 값이 넘어옴");
      return newBadge;
    },
    newBadgeInit: async () => {
      console.log(newBadge, "초기화는 여기서 진행");
      newBadge = 0;
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

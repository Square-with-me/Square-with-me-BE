const app = require("./app");
const sequelize = require("sequelize");
const { Op } = sequelize; // query를 필터링하는 where 구문을 위한 operation을 줄여서 Op라 하는 것 같다.
// where에 쓸 필터링 조건이 두개면 Op.and, or 조건으로 필터링한다면 Op.or 과 같은 식이다.

// const options = {
//   letsencrypt로 받은 인증서 경로를 입력
// }; -> 보안을 위해 사용가능, 사용시 인증서 발급과정에 http(80번 포트)가 사용되므로 80 -> 원하는 포트 로 포트포워딩 필요!

const server = require("http").createServer(app);

// https 실제 배포 시 연결
// const https = require("https").createServer(options, app);

const { Room, PersonInRoom, StudyTime } = require("./models");

// https 설정 시
// const io = require("socket.io")(https, {
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// 소켓 연결   -? 그래서 프론트랑 뭘 주고 받아야 하는데?
io.on("connection", (socket) => {
  let roomID;
  let peerID;
  let userID;
  let nickname;
  let streamID;
  let statusMsg;

  socket.on(
    "join-room",
    async (roomId, peerId, userId, nick, streamId, status) => {
      roomID = roomId;
      peerID = peerId;
      userID = userId;
      streamID = streamId;
      statusMsg = status;
      nickname = nick;
      try {
        socket.join(roomID);
        socket
          .to(roomID)
          .emit("user-connected", peerID, nickname, streamID, statusMsg);
        const users = await PersonInRoom.findAll({
          where: {
            roomId: roomID,
            userId: { [Op.not]: userID },
          },
        });
        socket.emit("welcome", users, users.length);

        const room = await Room.findByPk(roomID);
        const currentRound = room.currentRound;
        const totalRound = room.round;
        const openAt = room.openAt;
        const now = Date.now();

        socket.emit("restTime", currentRound, totalRound, openAt, now);
      } catch (error) {
        console.log(error);
      }
    }
  );

  socket.on("peer", (nick) => {
    socket.emit("peer", nick);
  });

  socket.on("endRest", async (currentRound) => {
    const room = await Room.findByPk(roomID);
    const openAt = Date.now() + room.studyTime * 60 * 1000;
    await Room.update(
      {
        currentRound,
        openAt,
        isStarted: 1,
      },
      { where: { roomID } }
    );
    const now = Date.now();
    socket.emit("studyTime", currentRound, room.round, openAt, now);
  });

  socket.on("endStudy", async () => {
    const room = await Room.findByPk(roomID);
    const openAt = Date.now() + room.recessTime * 60 * 1000;
    const currentRound = room.currentRound;
    const totalRound = room.round;

    await Room.update(
      {
        openAt,
        isStarted: 0,
      },
      { where: { roomID } }
    );

    await StudyTime.create({
      userId: userID,
      studyTime: room.studyTime,
    });
    const now = Date.now();
    socket.emit("restTime", currentRound, totalRound, openAt, now);
  });

  socket.on("totalEnd", async () => {
    const room = await Room.findByPk(roomID);
    await StudyTime.create({
      userId: userID,
      studyTime: room.studyTime,
    });
    const now = Date.now();
    const endTime = now + 60000;
    socket.emit("totalEnd", endTime, now);
  });

  socket.on("disconnecting", async () => {
    await PersonInRoom.destroy({
      where: {
        userId: userID,
        roomId: roomID,
      },
    });

    socket.to(roomID).emit("user-disconnected", peerID, nickname, streamID);

    const PIR_list = await PersonInRoom.findAll({
      where: {
        roomId: roomID,
      },
    });

    if (PIR_list.length === 0) {
      await Room.destroy({ where: { roomId: roomID } });
    }
  });

  socket.on("message", (message) => {
    socket.to(roomID).emit("message", nickname, message);
  });

  socket.on("join-chatRoom", (roomId, userId, userNickname) => {
    socket.join(roomId);
  });
});

// https 연결 시
// module.exports = { server, https };
module.exports = { server };

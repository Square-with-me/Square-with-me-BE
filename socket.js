const app = require("./app");
const server = require("http").createServer(app);
const sequelize = require("sequelize");
const { Op } = sequelize;
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    // credentials: true,
  },
});

//controller
const RoomController = require("./controllers/roomController");

const users = {};
const socketToRoom = {};
const socketToNickname = {};

io.on("connection", (socket) => {
  socket.on("join room", async (payload, done) => {
    const roomId = payload.roomId;
    const nickname = payload.nickname;

    if (!roomId || !nickname) {
      socket.emit("no data");
    };

    if(users[roomId]) {  // 기존 참가자 있음
      if(users[roomId].length >= 4) { // 참가자 풀방
        return done();
      };

      users[roomId].push(socket.id);
    } else {  // 첫 참가자
      users[roomId] = [socket.id];
    };

    socket.join(roomId);

    socketToRoom[socket.id] = roomId; //각각의 소켓아이디가 어떤 룸에 들어가는지
    socketToNickname[socket.id] = nickname;

    let otherUsers = users[roomId].filter((socketId) => socketId !== socket.id);

    otherUsers = otherUsers.map((socketId)=> {
      return {
        socketId: socketId,
        nickname: socketToNickname[socket.id]
      };
    });

    socket.emit("send users", otherUsers);
  });

  socket.on("send signal", (payload) => {
    const callerNickname = socketToNickname[payload.callerId];

    io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerId: payload.callerId,
        callerNickname,
      },
    );
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerId).emit("receive returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
    console.log("리터닝시그널");
  });

  socket.on("end", async (payload, done) => {
    const data = {
      userId: payload.userId,
      time: payload.time,
      categoryId: payload.categoryId,
      date: payload.date,
    }
    
    RoomController.delete.participant(data);
    done();
  });

  socket.on("disconnecting", () => {
    const roomId = socketToRoom[socket.id];

    if(users[roomId]) {
      users[roomId] = users[roomId].filter((id) => id !== socket.id);
    };

    socket.broadcast.emit("user left", {
      socketId: socket.id,
      nickname: socketToNickname[socket.id]
    });

    delete socketToNickname[socket.id];
  });
});

module.exports = { server };

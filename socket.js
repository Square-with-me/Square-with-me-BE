const app = require("./app");
const server = require("http").createServer(app);
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
const socketToUser = {};

io.on("connection", (socket) => {
  let roomId;
  let userId;

  let time = 0;
  let categoryId;
  let date;

  socket.on("join room", async (payload, done) => {
    roomId = payload.roomId;
    userId = payload.userId; // payload에 userId 추가 필요
    categoryId = payload.categoryId;  // payload 추가 필요
    date = payload.date;  // payload 추가 필요

    if (!roomId) {
      socket.emit("no data");
    }

    if (users[roomId]) { // 기존 참가자 있음
      
      if (users[roomId].length >= 4) { // 참가자 풀방
        return done();
      }

      users[roomId].push(socket.id);
    } else {
      // 첫 참가자
      users[roomId] = [socket.id];
    }

    socket.join(roomId);

    socketToRoom[socket.id] = roomId; // 각각의 소켓아이디가 어떤 룸에 들어가는지
    socketToNickname[socket.id] = payload.nickname;
    socketToUser[socket.id] = {
      roomId: payload.roomId,
      id: payload.userId,
      nickname: payload.nickname,
      profileImg: payload.profileImg,
      masterBadge: payload.masterBadge,
      statusMsg: payload.statusMsg,
    }

    let others = users[roomId].filter((socketId) => socketId !== socket.id);

    const otherSockets = others.map((socketId) => {
      return {
        socketId,
        nickname: socketToNickname[socket.id],
      };
    });
    const otherUsers = others.map((socketId) => {
      return socketToUser[socketId]
    });

    socket.emit("send users", { otherSockets, otherUsers });
  });

  socket.on("send signal", (payload) => {
    const callerNickname = socketToNickname[payload.callerId];
    const userInfo = socketToUser[socket.id];

    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerId: payload.callerId,
      callerNickname,
      userInfo,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerId).emit("receive returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("send_message", (payload) => {
    socket.broadcast.to(payload.roomId).emit('receive_message', payload);
  });
  socket.on("send_emoji", (payload) => {
    socket.broadcast.to(payload.roomId).emit('receive_emoji', payload);
  });

  socket.on("save_time", (payload) => {
    time = payload; // data received for every 1500 seconds
  });

  socket.on("disconnecting", async () => {
    const data = {
      roomId,
      userId,
      time: time,
      categoryId: categoryId,
      date: date,
    };

    await RoomController.delete.participant(data);



    if(users[roomId]) {
      users[roomId] = users[roomId].filter((id) => id !== socket.id);
    }
    const userInfo = socketToUser[socket.id];

    socket.broadcast.to(roomId).emit("user left", {
      socketId: socket.id,
      userInfo,
    });

    delete socketToNickname[socket.id];
    delete socketToUser[socket.id];
  });

  // 타이머
  socket.on("start_timer", (payload) => {
    socket.broadcast.to(payload.roomId).emit("start_receive", payload);
  });

  socket.on("stop_time", (roomId) => {
    socket.broadcast.to(roomId).emit("stop_receive");
  });

  socket.on("reset_time", (roomId) => {
    socket.broadcast.to(roomId).emit("reset_receive");
  });
});



module.exports = { server };

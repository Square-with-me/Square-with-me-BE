const app = require("./app");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});


// const {
//   sockets: {
//       adapter: { sids, rooms },
//   },
// } = wsServer;

const {
  sockets: {
      adapter: { sids, rooms },
  },
} = io;

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

	console.log("전역변수 roomId 이다ㅏㅏㅏㅏㅏㅏㅏㅏ", roomId)

  socket.on("join room", async (payload, done) => {
    roomId = payload.roomId;
    userId = payload.userId;
    categoryId = payload.categoryId;
    date = payload.date;

	  console.log("join room 했을 때 roomId", roomId)
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
   console.log("그 유저의 socket.id", socket.id);
    console.log("rooms socket join 하기 전", rooms);
    console.log("users 정보, socket join 하기 전, socket leave 하기 전", users)
    socket.join(roomId);
    console.log("rooms socket join 하고난 후후", rooms);

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
    console.log(otherUsers, "otherUsers");
    console.log("socket leave 하기전, otherUsers 하고난 후 socketToRoom socketToRoom socketToRoom",socketToRoom)

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

	  console.log("send_message할 때 roomId", roomId)
  });
  socket.on("send_emoji", (payload) => {
    socket.broadcast.to(payload.roomId).emit('receive_emoji', payload);
  });

  socket.on("save_time", (payload) => {
    time = payload; // data received for every 1500 seconds
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

  socket.on("check absence", () => {
    socket.emit("resend check absence", { socketId: socket.id, roomId: socketToRoom[socket.id] });
  });

  socket.on("quit room", async () => {
    const data = {
      roomId,
      userId,
      time: time,
      categoryId: categoryId,
      date: date,
    };

    await RoomController.delete.participant(data);

	  console.log("quit room 다 하고나서 roomId", roomId)

    

    if(users[roomId]) {
      users[roomId] = users[roomId].filter((id) => id !== socket.id);
    };
    const userInfo = socketToUser[socket.id];

    socket.broadcast.to(roomId).emit("user left", {
      socketId: socket.id,
      userInfo,
    });

    
    socket.leave(roomId)

    console.log("socket leave 하고 난 후 socketToRoom socketToRoom socketToRoom",socketToRoom)
    console.log("users 정보, socket leave 하고난 후", users)
    console.log("rooms socket join 하고난 후 socket leave까지 하고난 후", rooms);

    console.log("io.sockets io.sockets io.sockets io.sockets io.sockets", io.sockets)

    delete socketToNickname[socket.id];
    delete socketToUser[socket.id];
  });
 
  socket.on("disconnecting", async () => {
    console.log(socket.id, socketToNickname[socket.id], "님의 연결이 끊겼어요.");
  });
});



module.exports = { server };

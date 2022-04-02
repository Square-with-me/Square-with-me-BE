const app = require("./app");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

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

  socket.on("join room", async (payload, done) => {
    roomId = payload.roomId;
    userId = payload.userId;
    categoryId = payload.categoryId;
    date = payload.date;

    if (!roomId) { socket.emit("no data") };

    if (users[roomId]) { // 기존 참가자 있음
      if (users[roomId].length >= 4) { // 참가자 풀방
        return done();
      };

      users[roomId].push(socket.id);
    } else {
      // 첫 참가자
      users[roomId] = [socket.id];
    };
   
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
    };

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

    if(users[roomId]) {
      users[roomId] = users[roomId].filter((id) => id !== socket.id);
    };
    const userInfo = socketToUser[socket.id];

    socket.broadcast.to(roomId).emit("user left", {
      socketId: socket.id,
      userInfo,
    });

    socket.leave(roomId);

    delete socketToNickname[socket.id];
    delete socketToUser[socket.id];
    delete socketToRoom[socket.id];
  });

  socket.on("disconnecting", async () => {
    
    // 방 정보 남아있으면은 방 나가기 처리하도록

    console.log("if(users[roomId].includes(socket.id))이 트루인지 펄스인지 궁금하다 조건문 실행 before", users[roomId].includes(socket.id)? true: false)
    console.log("disconnecting 할 때 조건문 before",sids );
    if(users[roomId].includes(socket.id)) {
      
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
      };
      const userInfo = socketToUser[socket.id];
  
      socket.broadcast.to(roomId).emit("user left", {
        socketId: socket.id,
        userInfo,
      });
  
      socket.leave(roomId);
  
      delete socketToNickname[socket.id];
      delete socketToUser[socket.id];
      delete socketToRoom[socket.id];


      console.log(socket.id, socketToNickname[socket.id], "님의 연결이 끊겼어요.");
    };
    console.log("조건문 실행 after", users[roomId].includes(socket.id)? true: false)
    console.log("disconnecting 할 때 조건문 after",sids );
  });
});


module.exports = { server };

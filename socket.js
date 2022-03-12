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

// models
// const room = require("./models/room");
const user = require("./models/user");

//방에 몇명 있는지
function roomSize(roomID) {
  return io.sockets.adapter.rooms.get(roomID)?.size;
}

const users = {};
const socketToRoom = {};
const socketToNickname = {};

io.on("connection", (socket) => {
  // 참가자 관전자 나눈거
  // 방에 들어오면
  // socket.on("join room", async (roomID, userID, role) => {
  //   if (!roomID || !userID || !role) {
  //     return;
  //   }
  //   if (!users[roomID]) {
  //     users[roomID] = {};
  //     users[roomID].participants = [];
  //     users[roomID].viewers = [];
  //   }
  //   //roomID, role
  //   //asyncWrapper 쓰기
  //   try {
  //     let mySocketId = socket.id;

  //     //해당 방 안에 있는 사람들에게 영상공유를 할 수 있는 재료들을 건네줌
  //     if (role === "participants") {
  //       //참가자로 들어오면
  //       if (users[roomID].participants) {
  //         //이미 참가자가 있을때 배열에 push
  //         if (users[roomID].participants.length >= 4) {
  //           return alert("참가자 풀방");
  //         }
  //         users[roomID].participants.push(socket.id);
  //       } else {
  //         //참가자 배열이 존재하지 않으면 배열만들어주기
  //         users[roomID].participants = [socket.id];
  //       }
  //     } else if (role === "viewers") {
  //       //관전자로 들어오면
  //       if (users[roomID].viewers) {
  //         //이미 관전자가 있을때 배열에 push
  //         if (users[roomID].viewers.length >= 5) {
  //           return alert("관전자 풀방");
  //         }
  //         users[roomID].viewers.push(socket.id);
  //       } else {
  //         //관전자 배열이 존재하지 않으면 배열만들어주기
  //         users[roomID].viewers = [socket.id];
  //       }
  //     } else {
  //       return console.log("잘못된 접근");
  //     }
  //     socket.join(roomID);
  //     console.log(io.sockets.adapter.rooms);
  //     socketToRoom[socket.id] = roomID; //부딪히며 이해하기
  //     const participantsRoom = users[roomID].participants.filter(
  //       (id) => id !== socket.id
  //     );
  //     const viewersInthisRoom = users[roomID].viewers.filter(
  //       (id) => id !== socket.id
  //     );
  //     console.log(participantsRoom);
  //     // console.log(users);
  //     //usersInThisRoom을 참가자와 관전자로 나눠서 관전자의 peer는 video와 audio를 false로 할 수 있게 만듬
  //     //roomSize함수로 실시간 현재 총 인원을 방안에 표기함 (참가자,관전자 구분 안함)
  //     // socket.to(data.roomID)  //roomID안에 모든사람(나 자신 제외)
  //     // io.sockets.in(data.roomID)  //roomID안에 모든사람 (나 자신 포함)
  //     socket.emit("room users", participantsRoom, viewersInthisRoom);
  //     socket.to(roomID).emit("newbie", mySocketId);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  //참가자 관전자 안나눈거
  socket.on("join room", async (roomID,  nickname) => {
    if (!roomID || !nickname) {
      return console.log("뭔가 없다");
    }
    if (users[roomID]) {
      users[roomID].push(socket.id);
    } else {
      //배열이 존재하지 않으면 배열만들어주기
      users[roomID] = [socket.id];
    }
    socket.join(roomID);
    console.log(io.sockets.adapter.rooms);
    socketToRoom[socket.id] = roomID; //각각의 소켓아이디가 어떤 룸에 들어가는지
    socketToNickname[socket.id] = nickname;
    const otherInRoom = users[roomID].filter((id) => id !== socket.id);
    console.log(otherInRoom);
    // console.log(users);
    //usersInThisRoom을 참가자와 관전자로 나눠서 관전자의 peer는 video와 audio를 false로 할 수 있게 만듬
    //roomSize함수로 실시간 현재 총 인원을 방안에 표기함 (참가자,관전자 구분 안함)
    // socket.to(data.roomID)  //roomID안에 모든사람(나 자신 제외)
    // io.sockets.in(data.roomID)  //roomID안에 모든사람 (나 자신 포함)
    socket.emit("room users", otherInRoom); // ch: 피어 연결을 위함
  });

  //빡빡이 따라함
  socket.on("sending signal", (payload) => {
    const nickname = socketToNickname[payload.callerID]
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    },nickname);
    console.log(
      "센딩시그널콘솔 요청하는사람 ",
      payload.callerID,
      "받는사람 ",
      payload.userToSignal
    );
  });

  //빡빡이 따라함
  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
    console.log("리터닝시그널");
  });

  //disconnecting event는 socket이 방을 떠나기 바로 직전 발생합니다!
  // socket.on("disconnecting", () => {

  //   socket.rooms.forEach((roomID) =>
  //     socket.to(socket.id).emit("bye", socket.id, roomSize(roomID) - 1)
  //   );
  //   console.log("disconnecting거쳐감");
  //   //bye에서는 작별인사하기
  // });

  socket.on("disconnecting", () => {
    const roomID = socketToRoom[socket.id];
    if(users[roomID]){
      users[roomID] = users[roomID].filter((id) => id !== socket.id);
    }
    console.log("left", users);
    socket.broadcast.emit("user left", socket.id, socketToNickname[socket.id]);
    console.log(socketToNickname)
    delete socketToNickname[socket.id];
    console.log(socketToNickname)
  });

    //ch: 새로운 메시지 전송 기능
  /*
  프론트 측에서도 
  socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = ""; 같은 코드 필요
  */
    socket.on("new_message", (msg, room, sendMessage) => {
      socket.broadcast.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      sendMessage(); // 함수 실행 명령은 백엔드에서 하지만 실행되는 것은 프론트엔드 측임
  });


// 타이머
socket.on('start_timer', (data) => {
  console.log('타이머 시작 ', data);
  socket.broadcast.to(data.roomId).emit('start_receive', data);
});

socket.on('stop_time', (roomId) => {
  console.log('타이머 멈춤');
  socket.broadcast.to(roomId).emit('stop_receive');
});

socket.on('reset_time', (roomId) => {
  console.log('타이머 리셋');
  socket.broadcast.to(roomId).emit('reset_receive');
});





  ///////아마 채팅기능///////
  //   socket.on("message", (message) => {
  //     socket.to(roomID).emit("message", nickname, message);
  //   });

  //   socket.on("join-chatRoom", (roomId, userId, userNickname) => {
  //     socket.join(roomId);
  //   });
});

//////////////////빡빡쓰///////////////
// const users = {};

// const socketToRoom = {};

// io.on('connection', socket => {
//   socket.on("join room", roomID => {
//       if (users[roomID]) {
//           const length = users[roomID].length;
//           if (length === 4) {
//               socket.emit("room full");
//               return;
//           }
//           users[roomID].push(socket.id);
//       } else {
//           users[roomID] = [socket.id];
//       }
//       socketToRoom[socket.id] = roomID;
//       console.log(socketToRoom);
//       const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

//       socket.emit("all users", usersInThisRoom);
//   });

//   socket.on("sending signal", payload => {
//       io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
//   });

//   socket.on("returning signal", payload => {
//       io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
//   });

//   socket.on('disconnect', () => {
//       const roomID = socketToRoom[socket.id];
//       let room = users[roomID];
//       if (room) {
//           room = room.filter(id => id !== socket.id);
//           users[roomID] = room;
//       }
//   });

// });

module.exports = { server };

// 카메라 바꾸는거 (프론트)
// async function getCameras() {
//   try {
//       const devies = await navigator.mediaDevices.enumerateDevices();
//       const cameras = devies.filter((device) => device.kind === 'videoinput');
//       const currentCamera = myStream.getVideoTracks()[0];
//       cameras.forEach((camera) => {
//           const option = document.createElement('option');
//           option.value = camera.deviceId;
//           option.innerText = camera.label;
//           if (currentCamera.label === camera.label) {
//               option.selected = true;
//           }
//           camerasSelect.appendChild(option);
//       });
//   } catch (e) {
//       console.log(e);
//   }
// }
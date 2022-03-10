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
io.on("connection", (socket) => {
  // 방에 들어오면
  socket.on("join room", async (data) => {
    if (!data || !data.role || !data.roomID) {
      return;
    }
    if (!users[data.roomID]) {
      users[data.roomID] = {};
      users[data.roomID].participants = [];
      users[data.roomID].viewers = [];
    }
    //roomID, role
    //asyncWrapper 쓰기
    try {

      //해당 방 안에 있는 사람들에게 영상공유를 할 수 있는 재료들을 건네줌
      if (data.role === "participants") {
        //참가자로 들어오면
        if (users[data.roomID].participants) {
          //이미 참가자가 있을때 배열에 push
          if (users[data.roomID].participants.length >= 4) {
            return alert("참가자 풀방");
          }
          users[data.roomID].participants.push(socket.id);
        } else {
          //참가자 배열이 존재하지 않으면 배열만들어주기
          users[data.roomID].participants = [socket.id];
        }
      } else if (data.role === "viewers") {
        //관전자로 들어오면
        if (users[data.roomID].viewers) {
          //이미 관전자가 있을때 배열에 push
          if (users[data.roomID].viewers.length >= 5) {
            return alert("관전자 풀방");
          }
          users[data.roomID].viewers.push(socket.id);
        } else {
          //관전자 배열이 존재하지 않으면 배열만들어주기
          users[data.roomID].viewers = [socket.id];
        }
      } else {
        return console.log("잘못된 접근");
      }
      socket.join(data.roomID);
      console.log(io.sockets.adapter.rooms)
      socketToRoom[socket.id] = data.roomID; //부딪히며 이해하기
      const participantsRoom = users[data.roomID].participants.filter(
        (id) => id !== socket.id
      );
      const viewersInthisRoom = users[data.roomID].viewers.filter(
        (id) => id !== socket.id
      );
      console.log(participantsRoom)
      // console.log(users);
      //usersInThisRoom을 참가자와 관전자로 나눠서 관전자의 peer는 video와 audio를 false로 할 수 있게 만듬
      //roomSize함수로 실시간 현재 총 인원을 방안에 표기함 (참가자,관전자 구분 안함)
      // socket.to(data.roomID)  //roomID안에 모든사람(나 자신 제외)
      io.sockets.in(data.roomID)  //roomID안에 모든사람 (나 자신 포함)
      // socket
        .emit(
          "room users",
          participantsRoom,
          viewersInthisRoom,
        );
    } catch (error) {
      console.log(error);
    }
  });

  //빡빡이 따라함
  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
    console.log(payload)
  });

  //빡빡이 따라함
  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  //disconnecting event는 socket이 방을 떠나기 바로 직전 발생합니다!
  // socket.on("disconnecting", () => {

  //   socket.rooms.forEach((roomID) =>
  //     socket.to(socket.id).emit("bye", socket.id, roomSize(roomID) - 1)
  //   );
  //   console.log("disconnecting거쳐감");
  //   //bye에서는 작별인사하기
  // });

  socket.on("disconnect", () => {
    
    const roomID = socketToRoom[socket.id];
    if (!users[roomID]) {
      users[roomID] = {};
      users[roomID].participants = [];
      users[roomID].viewers = [];
    }
    users[roomID].participants = users[roomID].participants.filter(
      (id) => id !== socket.id
    );
    users[roomID].viewers = users[roomID].viewers.filter(
      (id) => id !== socket.id
    );
    console.log("left", users);
    users[roomID].participants.forEach((participant) =>
      socket.to(participant).emit("bye", socket.id, roomSize(roomID))
    );
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

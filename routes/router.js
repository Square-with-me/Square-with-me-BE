const express = require("express");
const router = express.Router();

// controllers
const UserController = require("../controllers/userController");
const RoomController = require("../controllers/roomController");

// middlewares
const middleware = require("../utils/middleware");

// api/user
router.post("/user/new", UserController.create.auth);   // 회원가입
router.post("/user", UserController.get.auth);   // 로그인
router.delete("/user");   // 로그아웃
router.get("/user/anonymous");   // 비회원 로그인
router.get("/user/me", middleware.auth, UserController.get.user);   // 로그인 유저 정보 가져오기

// api/room
router.post("/room/new");   // POST /api/room/new
router.delete("/room/:roomId/user/:userId");   // DELETE /api/room/3/user/2

// api/rooms
router.get("/rooms");   // GET /api/rooms?q=keyword
router.get("/rooms/all");   // GET /api/rooms/all
router.get("/rooms/hot");   // GET /api/rooms/hot

module.exports = router;
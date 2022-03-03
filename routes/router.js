const express = require("express");
const router = express.Router();

// controllers
const AuthController = require("../controllers/authController");
const UserController = require("../controllers/userController");
const RoomController = require("../controllers/roomController");

// middlewares
const middleware = require("../utils/middleware");

// api/auth
router.post("/auth/local", AuthController.local);   // 회원가입
router.get("/auth/anonymous");   // 비회원 로그인
router.get("/auth/kakao/callback", AuthController.kakao);   // 카카오 로그인 콜백

// api/user
router.post("/user", UserController.get.auth);   // 로그인
router.get("/user/me", middleware.auth, UserController.get.user);   // 로그인 유저 정보 가져오기

router.patch("/user/:userId/profile/img", middleware.auth, UserController.update.profileImg);   // 프로필 사진 수정
router.patch("/user/:userId/profile/nickname", middleware.auth, UserController.update.nickname);   // 닉네임 수정
router.patch("/user/:userId/profile/statusMsg", middleware.auth, UserController.update.statusMsg);   // 상태 메시지 수정

router.delete("/user");   // 로그아웃

// api/room
router.post("/room/new");   // POST /api/room/new
router.delete("/room/:roomId/user/:userId");   // DELETE /api/room/3/user/2

// api/rooms
router.get("/rooms");   // GET /api/rooms?q=keyword
router.get("/rooms/all");   // GET /api/rooms/all
router.get("/rooms/hot");   // GET /api/rooms/hot

module.exports = router;
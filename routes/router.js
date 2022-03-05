const express = require("express");
const router = express.Router();

// controllers
const AuthController = require("../controllers/authController");
const UserController = require("../controllers/userController");
const RoomController = require("../controllers/roomController");

// middlewares
const middleware = require("../utils/middleware");

// api/auth
router.post("/auth/local", AuthController.create.local);   // 회원가입
router.get("/auth/anon", AuthController.create.anon);   // 비회원 로그인
router.get("/auth/kakao/callback", AuthController.create.kakao);   // 카카오 로그인 콜백
router.post("/auth", AuthController.get.auth);   // 로그인
router.delete("/auth/:type", middleware.auth, AuthController.delete.auth);   // 로그아웃

// api/user
router.get("/user/me", middleware.auth, UserController.get.user);   // 로그인 유저 정보 가져오기

router.patch("/user/:userId/profile/img", middleware.auth, UserController.update.profileImg);   // 프로필 사진 수정
router.patch("/user/:userId/profile/nickname", middleware.auth, UserController.update.nickname);   // 닉네임 수정
router.patch("/user/:userId/profile/statusMsg", middleware.auth, UserController.update.statusMsg);   // 상태 메시지 수정

// api/room
router.post("/room/new", middleware.auth, RoomController.create.room);   // 방 생성하기
router.post("/room/:roomId/user/:userId", middleware.auth, RoomController.create.participant);   // 방 참가하기
router.delete("/room/:roomId/user/:userId", middleware.auth, RoomController.delete.participant);   // 방 나가기

// api/rooms
router.get("/rooms", RoomController.get.rooms);   // 방 목록 불러오기
router.get("/rooms/category/:categoryId", RoomController.get.categoryRooms);   // 방 목록 불러오기

module.exports = router;
const express = require("express");
const router = express.Router();

// controllers
// const AuthController = require("../controllers/authController");  // 쿠키 버전
const AuthController = require("../controllers/authController_notCookie");  // 쿠키 x 버전


const UserController = require("../controllers/userController");
const RoomController = require("../controllers/roomController");

// utils
const { localUpload, s3Upload } = require("../utils/util");

// middlewares
const middleware = require("../utils/middleware");

// api/auth
router.post("/auth/local", AuthController.create.local);   // 회원가입
router.get("/auth/kakao/callback", AuthController.create.kakao);   // 카카오 로그인 콜백
router.post("/auth", AuthController.get.auth);   // 로그인, 출석과 관련된 뱃지도 지급
router.delete("/auth/:type", middleware.auth, AuthController.delete.auth);   // 로그아웃

// api/user
router.get("/user/me", middleware.auth, UserController.get.user);   // 로그인 유저 정보 가져오기

router.get("/user/:userId/badges", middleware.auth, UserController.get.badges);   // 보유한 뱃지 목록 가져오기
router.get("/user/:userId/records", middleware.auth, UserController.get.records);   // 네모와 함께한 시간 가져오기

router.patch("/user/:userId/profile/img", middleware.auth, UserController.update.profileImg);   // 프로필 사진 수정
router.patch("/user/:userId/profile/nickname", middleware.auth, UserController.update.nickname);   // 닉네임 수정
router.patch("/user/:userId/profile/statusMsg", middleware.auth, UserController.update.statusMsg);   // 상태 메시지 수정
router.patch("/user/:userId/profile/masterBadge", middleware.auth, UserController.update.masterBadge);   // 대표 뱃지 수정

// api/room
router.post("/room/new", middleware.auth, RoomController.create.room);   // 방 생성하기
router.post("/room/:roomId/user/:userId", middleware.auth, RoomController.create.participant);   // 방 참가하기
router.get("/room/:roomId/pwd/:pwd", middleware.auth, RoomController.get.pwd);  // 비밀번호 확인하기
// router.delete("/room/:roomId/user/:userId", middleware.auth, RoomController.delete.participant);   // 방 나가기, 시간과 관련된 뱃지 지급

router.get("/room/:roomId/like", middleware.auth, RoomController.create.like);   // 좋아요
router.delete("/room/:roomId/like", middleware.auth, RoomController.delete.like);   // 좋아요 취소

// api/rooms
router.get("/rooms", RoomController.get.rooms);   // 방 목록 불러오기
router.get("/rooms/category/:categoryId", RoomController.get.categoryRooms); // 방 목록 불러오기

// /api/upload
// router.post("/upload/image", middleware.auth, localUpload.single("image"), (req, res, next) => {
//   res.json(req.file.filename);
// });   // 이미지 업로드

// /api/upload
router.post("/upload/image", middleware.auth, s3Upload.single("image"), (req, res, next) => {
  res.json(req.file.location);
});   // 이미지 업로드 for S3

module.exports = router;
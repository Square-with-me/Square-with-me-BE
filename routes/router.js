const express = require("express");
const router = express.Router();

// controllers
const UserController = require("../controllers/userController");
const RoomController = require("../controllers/roomController");

// api/user
router.post("/user/new", UserController.create.user);   // POST api/user/new
router.post("/user");   // POST /api/user

// api/room
router.post("/room/new");   // POST /api/room/new
router.delete("/room/:roomId/user/:userId");   // DELETE /api/room/3/user/2

// api/rooms
router.get("/rooms");   // GET /api/rooms?q=keyword
router.get("/rooms/all");   // GET /api/rooms/all
router.get("/rooms/hot");   // GET /api/rooms/hot

module.exports = router;
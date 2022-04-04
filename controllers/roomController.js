"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.methodForTs = void 0;
var Op = require("sequelize").Op;
// MySQL models
var _a = require("../models"), Room = _a.Room, Tag = _a.Tag, Category = _a.Category, User = _a.User, Like = _a.Like, Badge = _a.Badge;
// Mongo collections
var WeekRecord = require("../mongoSchemas/weekRecord");
var MonthRecord = require("../mongoSchemas/monthRecord");
var Log = require("../mongoSchemas/log");
// utils
var _b = require("../utils/util"), asyncWrapper = _b.asyncWrapper, getDay = _b.getDay;
// korean local time
var dateUtil = require("../utils/date");
var methodForTs = function (req, res, next) { };
exports.methodForTs = methodForTs;
var CATEGORY = {
    // 카테고리 목록
    뷰티: "beauty",
    운동: "sports",
    스터디: "study",
    상담: "counseling",
    문화: "culture",
    기타: "etc"
};
var CATEGORY_BADGE_CRITERIA = 60; // 카테고리 뱃지 지급 기준(단위 : 분)
module.exports = {
    create: {
        room: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, _a, title, isSecret, pwd, categoryId, tags, isExistTitle, newRoom, result, roomInfo, roomId, category, entryTime, roomTitle, createLog;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        userId = res.locals.user.id;
                        _a = req.body, title = _a.title, isSecret = _a.isSecret, pwd = _a.pwd, categoryId = _a.categoryId, tags = _a.tags;
                        return [4 /*yield*/, Room.findOne({
                                where: { title: title }
                            })];
                    case 1:
                        isExistTitle = _b.sent();
                        if (isExistTitle) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이미 존재하는 방 제목입니다."
                                })];
                        }
                        ;
                        return [4 /*yield*/, Room.create({
                                title: title,
                                isSecret: isSecret,
                                pwd: pwd,
                                categoryId: categoryId,
                                masterUserId: userId,
                                participantCnt: 1
                            })];
                    case 2:
                        newRoom = _b.sent();
                        return [4 /*yield*/, Promise.all(tags.map(function (tag) {
                                return Tag.findOrCreate({
                                    where: { name: tag }
                                });
                            }))];
                    case 3:
                        result = _b.sent();
                        return [4 /*yield*/, newRoom.addTags(result.map(function (v) { return v[0]; }))];
                    case 4:
                        _b.sent();
                        // 참가자 추가
                        return [4 /*yield*/, newRoom.addParticipants(userId)];
                    case 5:
                        // 참가자 추가
                        _b.sent();
                        return [4 /*yield*/, Room.findOne({
                                where: { id: newRoom.id },
                                attributes: [
                                    "id",
                                    "title",
                                    "isSecret",
                                    "masterUserId",
                                    "likeCnt",
                                    "participantCnt",
                                ],
                                include: [
                                    {
                                        model: Category,
                                        attributes: ["id", "name"]
                                    },
                                    {
                                        model: Tag,
                                        as: "Tags",
                                        attributes: ["id", "name"],
                                        through: { attributes: [] }
                                    },
                                    {
                                        model: User,
                                        as: "Participants",
                                        attributes: ["id", "nickname", "masterBadgeId"],
                                        through: { attributes: [] }
                                    },
                                ]
                            })];
                    case 6:
                        roomInfo = _b.sent();
                        roomId = roomInfo.id;
                        category = roomInfo.category.id;
                        entryTime = dateUtil.koreanDate();
                        roomTitle = roomInfo.title;
                        createLog = new Log({
                            userId: userId,
                            entryTime: entryTime,
                            roomId: roomId,
                            category: category,
                            roomTitle: roomTitle
                        });
                        return [4 /*yield*/, createLog.save()];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, res.status(201).json({
                                isSuccess: true,
                                data: roomInfo
                            })];
                }
            });
        }); }),
        participant: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, roomId, userId, roomInfo, category, entryTime, roomTitle, createLog;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.params, roomId = _a.roomId, userId = _a.userId;
                        return [4 /*yield*/, Room.findOne({
                                where: { id: roomId },
                                attributes: [
                                    "id",
                                    "title",
                                    "isSecret",
                                    "masterUserId",
                                    "likeCnt",
                                    "participantCnt",
                                ],
                                include: [
                                    {
                                        model: Category,
                                        attributes: ["id", "name"]
                                    },
                                    {
                                        model: Tag,
                                        as: "Tags",
                                        attributes: ["id", "name"],
                                        through: { attributes: [] }
                                    },
                                    {
                                        model: User,
                                        as: "Participants",
                                        attributes: ["id", "nickname", "masterBadgeId"],
                                        through: { attributes: [] }
                                    },
                                ]
                            })];
                    case 1:
                        roomInfo = _b.sent();
                        // 현재 참가자 수 확인
                        if (roomInfo.participantCnt >= 4) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "인원이 모두 찼습니다."
                                })];
                        }
                        // 참가자 추가
                        return [4 /*yield*/, roomInfo.addParticipants(userId)];
                    case 2:
                        // 참가자 추가
                        _b.sent();
                        // 참가자 수 + 1
                        return [4 /*yield*/, roomInfo.increment("participantCnt")];
                    case 3:
                        // 참가자 수 + 1
                        _b.sent();
                        category = roomInfo.category.id;
                        entryTime = dateUtil.koreanDate();
                        roomTitle = roomInfo.title;
                        createLog = new Log({
                            userId: userId,
                            entryTime: entryTime,
                            roomId: roomId,
                            category: category,
                            roomTitle: roomTitle
                        });
                        return [4 /*yield*/, createLog.save()];
                    case 4:
                        _b.sent();
                        res.status(201).json({
                            isSuccess: true,
                            data: roomInfo
                        });
                        return [2 /*return*/];
                }
            });
        }); })
    },
    update: {},
    get: {
        rooms: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, query, page, offset, Page, roomSearchingLimit, rooms, _b;
            var _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _a = req.query, query = _a.q, page = _a.p;
                        offset = 0;
                        Page = Number(page);
                        roomSearchingLimit = 0;
                        if (Page === 2) { // 처음에는 7개만 보내주니까 처음에는 7개만 상쇄(offset)
                            offset = 7;
                        }
                        else if (Page > 2) {
                            offset = 7 + 8 * (Page - 2);
                        }
                        Page === 1
                            ? roomSearchingLimit = 7 // 첫 페이지만 7개 리턴
                            : roomSearchingLimit = 8;
                        rooms = [];
                        _b = query;
                        switch (_b) {
                            case "all": return [3 /*break*/, 1];
                            case "possible": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, Room.findAll({
                            offset: offset,
                            limit: roomSearchingLimit,
                            attributes: [
                                "id",
                                "title",
                                "isSecret",
                                "createdAt",
                                "likeCnt",
                                "participantCnt",
                            ],
                            include: [
                                {
                                    model: Category,
                                    attributes: ["id", "name"]
                                },
                                {
                                    model: Tag,
                                    as: "Tags",
                                    attributes: ["id", "name"],
                                    through: { attributes: [] }
                                },
                            ],
                            order: [["createdAt", "desc"]]
                        })];
                    case 2:
                        // 전체 방 목록 가져오기
                        rooms = _j.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, Room.findAll({
                            where: (_c = {},
                                _c[Op.and] = [
                                    { participantCnt: (_d = {}, _d[Op.lte] = 3, _d) },
                                    { isSecret: false },
                                ],
                                _c),
                            offset: offset,
                            limit: roomSearchingLimit,
                            attributes: [
                                "id",
                                "title",
                                "isSecret",
                                "createdAt",
                                "likeCnt",
                                "participantCnt",
                            ],
                            include: [
                                {
                                    model: Category,
                                    attributes: ["id", "name"]
                                },
                                {
                                    model: Tag,
                                    as: "Tags",
                                    attributes: ["id", "name"],
                                    through: { attributes: [] }
                                },
                            ],
                            order: [["createdAt", "desc"]]
                        })];
                    case 4:
                        rooms = _j.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, Room.findAll({
                            where: (_e = {},
                                _e[Op.or] = [
                                    { title: (_f = {}, _f[Op.like] = "%".concat(query, "%"), _f) },
                                    { "$Category.name$": (_g = {}, _g[Op.like] = "%".concat(query, "%"), _g) },
                                    { "$Tag.name$": (_h = {}, _h[Op.like] = "%".concat(query, "%"), _h) },
                                ],
                                _e),
                            offset: offset,
                            limit: roomSearchingLimit,
                            attributes: [
                                "id",
                                "title",
                                "isSecret",
                                "createdAt",
                                "likeCnt",
                                "participantCnt",
                            ],
                            include: [
                                {
                                    model: Category,
                                    attributes: ["id", "name"]
                                },
                                {
                                    model: Tag,
                                    as: "Tags",
                                    attributes: ["id", "name"],
                                    through: { attributes: [] }
                                },
                            ],
                            order: [["createdAt", "desc"]]
                        })];
                    case 6:
                        // 검색어로 검색하는 경우 => 비슷한 방 제목 목록 가져오기
                        rooms = _j.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        ;
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: rooms
                            })];
                }
            });
        }); }),
        categoryRooms: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var categoryId, page, offset, Page, roomSearchingLimit, rooms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        categoryId = req.params.categoryId;
                        page = req.query.p;
                        offset = 0;
                        Page = Number(page);
                        roomSearchingLimit = 0;
                        if (Page === 2) {
                            offset = 7;
                        }
                        else if (Page > 2) {
                            offset = 7 + 8 * (Page - 2);
                        }
                        Page === 1
                            ? roomSearchingLimit = 7
                            : roomSearchingLimit = 8;
                        return [4 /*yield*/, Room.findAll({
                                where: { categoryId: categoryId },
                                offset: offset,
                                limit: roomSearchingLimit,
                                attributes: [
                                    "id",
                                    "title",
                                    "isSecret",
                                    "createdAt",
                                    "likeCnt",
                                    "participantCnt",
                                ],
                                include: [
                                    {
                                        model: Category,
                                        attributes: ["id", "name"]
                                    },
                                    {
                                        model: Tag,
                                        as: "Tags",
                                        attributes: ["id", "name"],
                                        through: { attributes: [] }
                                    },
                                ],
                                order: [["createdAt", "desc"]]
                            })];
                    case 1:
                        rooms = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: rooms
                            })];
                }
            });
        }); }),
        pwd: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, roomId, pwd, room, pwdCheck;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.params, roomId = _a.roomId, pwd = _a.pwd;
                        return [4 /*yield*/, Room.findOne({
                                where: { id: roomId }
                            })];
                    case 1:
                        room = _b.sent();
                        pwdCheck = room.pwd === pwd;
                        if (!pwdCheck) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "비밀번호가 일치하지 않습니다."
                                })];
                        }
                        ;
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true
                            })];
                }
            });
        }); })
    },
    "delete": {
        participant: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var roomId, userId, time, categoryId, date, user, category, categoryName, room, day, checkingDate, test, monthRecord, lastUpdatedMonth, checkingMonth, weekdaysRecord, lastUpdatedDate, oneDay, lastUpdatedZeroHour, checkingZeroHour, numLUZ, numCZH, preRecord, badgeCategory, categoryBadge, userCategoryBadge, updateOption, _a, preMonthRecord, userRecords, categoryTotalTime, updateOption, _b, preMonthRecord, userRecords, categoryTotalTime, exitTime, isMasterUser, _c, participants, left, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("data", data);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 89, , 90]);
                        roomId = data.roomId, userId = data.userId, time = data.time, categoryId = data.categoryId, date = data.date;
                        return [4 /*yield*/, User.findOne({
                                where: {
                                    id: userId
                                }
                            })];
                    case 2:
                        user = _d.sent();
                        return [4 /*yield*/, Category.findOne({
                                where: {
                                    id: categoryId
                                }
                            })];
                    case 3:
                        category = _d.sent();
                        categoryName = category.name;
                        return [4 /*yield*/, Room.findOne({
                                where: { id: roomId }
                            })];
                    case 4:
                        room = _d.sent();
                        if (!room) {
                            console.log('존재하지 않는 방 정보입니다.');
                            return [2 /*return*/];
                        }
                        day = getDay(date);
                        checkingDate = dateUtil.koreanDate();
                        test = void 0;
                        return [4 /*yield*/, MonthRecord.find({ userId: userId }, { _id: 0, __v: 0 })];
                    case 5:
                        monthRecord = _d.sent();
                        if (monthRecord.length === 0) {
                            return [2 /*return*/];
                        }
                        lastUpdatedMonth = monthRecord[0].lastUpdatedDate.getMonth() + 1;
                        checkingMonth = checkingDate.getMonth() + 1;
                        if (!(lastUpdatedMonth !== checkingMonth || // 달이 다르거나
                            monthRecord[0].lastUpdatedDate.getFullYear() !==
                                checkingDate.getFullYear()) // 연도가 다를 때
                        ) return [3 /*break*/, 8]; // 연도가 다를 때
                        return [4 /*yield*/, MonthRecord.updateMany({ userId: userId }, { $set: { time: 0, lastUpdatedDate: checkingDate } })];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, MonthRecord.find({ userId: userId }, { _id: 0, __v: 0 })];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8: return [4 /*yield*/, WeekRecord.find({ userId: userId }, { _id: 0, __v: 0 })];
                    case 9:
                        weekdaysRecord = _d.sent();
                        if (weekdaysRecord.length === 0) {
                            console.log('일치하는 유저 정보가 없습니다.');
                            return [2 /*return*/];
                        }
                        lastUpdatedDate = user.lastUpdated;
                        oneDay = 86400000;
                        lastUpdatedZeroHour = new Date(lastUpdatedDate.getFullYear(), lastUpdatedDate.getMonth(), lastUpdatedDate.getDate(), 0);
                        checkingZeroHour = new Date(checkingDate.getFullYear(), checkingDate.getMonth(), checkingDate.getDate(), 0);
                        numLUZ = Number(lastUpdatedZeroHour);
                        numCZH = Number(checkingZeroHour);
                        if (!(checkingZeroHour.getDay() === 0)) return [3 /*break*/, 14];
                        if (!(numLUZ <= numCZH - 7 * oneDay || // 주가 다를 때
                            numCZH + 1 * oneDay <= numLUZ)) return [3 /*break*/, 13];
                        return [4 /*yield*/, User.update({ lastUpdated: checkingDate }, { where: { id: userId } })];
                    case 10:
                        _d.sent();
                        return [4 /*yield*/, WeekRecord.updateMany({ userId: userId }, {
                                $set: {
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                }
                            })];
                    case 11:
                        _d.sent();
                        return [4 /*yield*/, WeekRecord.find({ userId: userId }, { _id: 0, __v: 0 })];
                    case 12:
                        weekdaysRecord = _d.sent();
                        _d.label = 13;
                    case 13: return [3 /*break*/, 18];
                    case 14:
                        if (!(numLUZ <=
                            numCZH - checkingZeroHour.getDay() * oneDay ||
                            numCZH + (8 - checkingZeroHour.getDay()) * oneDay <=
                                numLUZ)) return [3 /*break*/, 18];
                        return [4 /*yield*/, User.update({ lastUpdated: checkingDate }, { where: { id: userId } })];
                    case 15:
                        _d.sent();
                        return [4 /*yield*/, WeekRecord.updateMany({ userId: userId }, {
                                $set: {
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                }
                            })];
                    case 16:
                        _d.sent();
                        return [4 /*yield*/, WeekRecord.find({ userId: userId }, { _id: 0, __v: 0 })];
                    case 17:
                        weekdaysRecord = _d.sent();
                        _d.label = 18;
                    case 18:
                        preRecord = null;
                        badgeCategory = CATEGORY[categoryName];
                        return [4 /*yield*/, Badge.findOne({
                                // 해당 카테고리의 뱃지 가져오기
                                where: {
                                    name: badgeCategory
                                }
                            })];
                    case 19:
                        categoryBadge = _d.sent();
                        return [4 /*yield*/, user.getMyBadges({
                                // 유저의 카테고리 뱃지 소유 여부
                                where: {
                                    id: categoryBadge.id
                                }
                            })];
                    case 20:
                        userCategoryBadge = _d.sent();
                        if (!(day === "sun")) return [3 /*break*/, 47];
                        updateOption = {};
                        _a = categoryId;
                        switch (_a) {
                            case 1: return [3 /*break*/, 21];
                            case 2: return [3 /*break*/, 24];
                            case 3: return [3 /*break*/, 27];
                            case 4: return [3 /*break*/, 30];
                            case 5: return [3 /*break*/, 33];
                            case 6: return [3 /*break*/, 36];
                        }
                        return [3 /*break*/, 39];
                    case 21: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "beauty"
                        })];
                    case 22:
                        preRecord = _d.sent();
                        console.log("뷰티 시간 저장아 되어랏, 일요일");
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 23:
                        _d.sent();
                        return [3 /*break*/, 40];
                    case 24: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "sports"
                        })];
                    case 25:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 26:
                        _d.sent();
                        return [3 /*break*/, 40];
                    case 27: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "study"
                        })];
                    case 28:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 29:
                        _d.sent();
                        return [3 /*break*/, 40];
                    case 30: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "counseling"
                        })];
                    case 31:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 32:
                        _d.sent();
                        return [3 /*break*/, 40];
                    case 33: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "culture"
                        })];
                    case 34:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 35:
                        _d.sent();
                        return [3 /*break*/, 40];
                    case 36: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "etc"
                        })];
                    case 37:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.updateOne(updateOption)];
                    case 38:
                        _d.sent();
                        return [3 /*break*/, 40];
                    case 39: return [3 /*break*/, 40];
                    case 40: return [4 /*yield*/, MonthRecord.findOne({ userId: userId, date: date })];
                    case 41:
                        preMonthRecord = _d.sent();
                        return [4 /*yield*/, preMonthRecord.updateOne({
                                time: preMonthRecord.time + time
                            })];
                    case 42:
                        _d.sent();
                        return [4 /*yield*/, WeekRecord.findOne({
                                userId: userId,
                                category: badgeCategory
                            })];
                    case 43:
                        userRecords = _d.sent();
                        categoryTotalTime = userRecords.mon +
                            userRecords.tue +
                            userRecords.wed +
                            userRecords.thur +
                            userRecords.fri +
                            userRecords.sat +
                            userRecords.sun;
                        if (!(CATEGORY_BADGE_CRITERIA <= categoryTotalTime &&
                            userCategoryBadge.length === 0)) return [3 /*break*/, 46];
                        return [4 /*yield*/, user.addMyBadges(categoryBadge.id)];
                    case 44:
                        _d.sent();
                        return [4 /*yield*/, user.update({ newBadge: categoryBadge.id })];
                    case 45:
                        _d.sent();
                        _d.label = 46;
                    case 46: return [3 /*break*/, 73];
                    case 47:
                        updateOption = {};
                        _b = categoryId;
                        switch (_b) {
                            case 1: return [3 /*break*/, 48];
                            case 2: return [3 /*break*/, 51];
                            case 3: return [3 /*break*/, 54];
                            case 4: return [3 /*break*/, 57];
                            case 5: return [3 /*break*/, 60];
                            case 6: return [3 /*break*/, 63];
                        }
                        return [3 /*break*/, 66];
                    case 48: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "beauty"
                        })];
                    case 49:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 50:
                        _d.sent();
                        return [3 /*break*/, 67];
                    case 51: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "sports"
                        })];
                    case 52:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 53:
                        _d.sent();
                        return [3 /*break*/, 67];
                    case 54: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "study"
                        })];
                    case 55:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 56:
                        _d.sent();
                        return [3 /*break*/, 67];
                    case 57: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "counseling"
                        })];
                    case 58:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 59:
                        _d.sent();
                        return [3 /*break*/, 67];
                    case 60: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "culture"
                        })];
                    case 61:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.update(updateOption)];
                    case 62:
                        _d.sent();
                        return [3 /*break*/, 67];
                    case 63: return [4 /*yield*/, WeekRecord.findOne({
                            userId: userId,
                            category: "etc"
                        })];
                    case 64:
                        preRecord = _d.sent();
                        updateOption[day] = preRecord[day] + time;
                        return [4 /*yield*/, preRecord.updateOne(updateOption)];
                    case 65:
                        _d.sent();
                        return [3 /*break*/, 67];
                    case 66: return [3 /*break*/, 67];
                    case 67:
                        ;
                        return [4 /*yield*/, MonthRecord.findOne({ userId: userId, date: date })];
                    case 68:
                        preMonthRecord = _d.sent();
                        return [4 /*yield*/, preMonthRecord.updateOne({
                                time: preMonthRecord.time + time
                            })];
                    case 69:
                        _d.sent();
                        return [4 /*yield*/, WeekRecord.findOne({
                                userId: userId,
                                category: badgeCategory
                            })];
                    case 70:
                        userRecords = _d.sent();
                        categoryTotalTime = userRecords.mon +
                            userRecords.tue +
                            userRecords.wed +
                            userRecords.thur +
                            userRecords.fri +
                            userRecords.sat +
                            userRecords.sun;
                        if (!(CATEGORY_BADGE_CRITERIA <= categoryTotalTime &&
                            userCategoryBadge.length === 0)) return [3 /*break*/, 73];
                        return [4 /*yield*/, user.addMyBadges(categoryBadge.id)];
                    case 71:
                        _d.sent();
                        return [4 /*yield*/, user.update({ newBadge: categoryBadge.id })];
                    case 72:
                        _d.sent();
                        _d.label = 73;
                    case 73:
                        exitTime = dateUtil.koreanDate();
                        return [4 /*yield*/, Log.findOneAndUpdate({ userId: userId, roomId: roomId }, { exitTime: exitTime })];
                    case 74:
                        _d.sent();
                        isMasterUser = userId === room.masterUserId;
                        _c = isMasterUser;
                        switch (_c) {
                            case true: return [3 /*break*/, 75];
                            case false: return [3 /*break*/, 81];
                        }
                        return [3 /*break*/, 84];
                    case 75: return [4 /*yield*/, room.getParticipants({
                            order: [["createdAt"]]
                        })];
                    case 76:
                        participants = _d.sent();
                        if (!(participants.length > 1)) return [3 /*break*/, 78];
                        // 남은 인원 2명 이상이면 다음으로 들어온 사람한테 방장 넘기기
                        return [4 /*yield*/, room.update({
                                masterUserId: participants[1].id
                            })];
                    case 77:
                        // 남은 인원 2명 이상이면 다음으로 들어온 사람한테 방장 넘기기
                        _d.sent();
                        _d.label = 78;
                    case 78: return [4 /*yield*/, room.removeParticipants(userId)];
                    case 79:
                        _d.sent(); // 나 자신은 참가자에서 없애기
                        return [4 /*yield*/, room.decrement("participantCnt")];
                    case 80:
                        _d.sent();
                        return [3 /*break*/, 85];
                    case 81: return [4 /*yield*/, room.removeParticipants(userId)];
                    case 82:
                        _d.sent(); // 참가자에서 없애기
                        return [4 /*yield*/, room.decrement("participantCnt")];
                    case 83:
                        _d.sent();
                        return [3 /*break*/, 85];
                    case 84: return [3 /*break*/, 85];
                    case 85: return [4 /*yield*/, room.getParticipants()];
                    case 86:
                        left = _d.sent();
                        if (!(left.length === 0)) return [3 /*break*/, 88];
                        return [4 /*yield*/, Room.destroy({
                                where: { id: roomId }
                            })];
                    case 87:
                        _d.sent();
                        _d.label = 88;
                    case 88: return [3 /*break*/, 90];
                    case 89:
                        error_1 = _d.sent();
                        console.error(error_1);
                        return [3 /*break*/, 90];
                    case 90: return [2 /*return*/];
                }
            });
        }); }
    }
};

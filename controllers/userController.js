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
// utils
var _a = require("../utils/util"), asyncWrapper = _a.asyncWrapper, asyncWrapperWithTransaction = _a.asyncWrapperWithTransaction, regex = _a.regex;
// models
var _b = require("../models"), User = _b.User, Badge = _b.Badge;
// korean local time
var dateUtil = require("../utils/date");
var methodForTs = function (req, res, next) { };
exports.methodForTs = methodForTs;
module.exports = {
    create: {},
    giveBadge: {
        bug: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, bugBadgeId, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.params.userId;
                        bugBadgeId = 8;
                        return [4 /*yield*/, User.findOne({
                                where: { id: userId }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "일치하는 유저 정보가 없습니다."
                                })];
                        }
                        ;
                        return [4 /*yield*/, user.addMyBadges(bugBadgeId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, user.update({ newBadge: bugBadgeId })];
                    case 3:
                        _a.sent(); // 버그뱃지도 지급 시 뉴 뱃지로 추가
                        return [2 /*return*/, res.status(201).json({
                                isSuccess: true,
                                msg: "버그/리뷰 뱃지 지급 성공"
                            })];
                }
            });
        }); })
    },
    update: {
        profileImg: asyncWrapperWithTransaction(function (req, res, next, t) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, profileImg, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.params.userId;
                        profileImg = req.body.profileImg;
                        return [4 /*yield*/, User.findOne({
                                where: { id: userId }
                            }, { transaction: t })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                profileImg: profileImg
                            }, { transaction: t })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, t.commit()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: {
                                    profileImg: profileImg
                                }
                            })];
                }
            });
        }); }),
        nickname: asyncWrapperWithTransaction(function (req, res, next, t) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, nickname, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.params.userId;
                        nickname = req.body.nickname;
                        if (nickname.length < 2 || nickname.length > 8) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "닉네임은 2글자 ~ 8글자로 적어주세요."
                                })];
                        }
                        ;
                        if (!regex.checkNickname(nickname)) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "닉네임에 특수문자를 사용할 수 없습니다."
                                })];
                        }
                        ;
                        return [4 /*yield*/, User.findOne({
                                where: { id: userId }
                            }, { transaction: t })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                nickname: nickname
                            }, { transaction: t })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, t.commit()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: {
                                    nickname: nickname
                                }
                            })];
                }
            });
        }); }),
        statusMsg: asyncWrapperWithTransaction(function (req, res, next, t) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, statusMsg, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.params.userId;
                        statusMsg = req.body.statusMsg;
                        if (statusMsg.length < 1 || statusMsg.length > 20) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "상태 메시지는 1글자 ~ 20글자로 적어주세요."
                                })];
                        }
                        ;
                        return [4 /*yield*/, User.findOne({
                                where: { id: userId }
                            }, { transaction: t })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                statusMsg: statusMsg
                            }, { transaction: t })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, t.commit()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: {
                                    statusMsg: statusMsg
                                }
                            })];
                }
            });
        }); }),
        masterBadge: asyncWrapperWithTransaction(function (req, res, next, t) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, badgeId, user, badge;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = res.locals.user.id;
                        badgeId = req.body.badgeId;
                        return [4 /*yield*/, User.findOne({
                                where: { id: userId }
                            }, { transaction: t })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                masterBadgeId: badgeId
                            }, { transaction: t })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, Badge.findOne({
                                where: { id: badgeId },
                                attributes: ["id", "name", "imageUrl"]
                            }, { transaction: t })];
                    case 3:
                        badge = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: badge
                            })];
                }
            });
        }); })
    },
    get: {
        users: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.findAll({
                            order: [["origin"]]
                        })];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: {
                                    users: users
                                }
                            })];
                }
            });
        }); }),
        user: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = res.locals.user;
                return [2 /*return*/, res.status(200).json({
                        isSuccess: true,
                        data: {
                            user: user
                        }
                    })];
            });
        }); }),
        // 보유한 뱃지 정보 가져오기
        badges: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var user, badges, newBadge;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = res.locals.user;
                        return [4 /*yield*/, user.getMyBadges({
                                attributes: ["id", "name", "imageUrl"]
                            })];
                    case 1:
                        badges = _a.sent();
                        return [4 /*yield*/, User.findOne({
                                where: {
                                    id: user.id
                                },
                                attributes: ["newBadge"]
                            })
                            // newBadge 가 있는 경우
                        ];
                    case 2:
                        newBadge = _a.sent();
                        if (!(newBadge.dataValues.newBadge !== null)) return [3 /*break*/, 4];
                        res.status(200).json({
                            isSuccess: true,
                            data: badges,
                            newBadge: newBadge.dataValues.newBadge
                        });
                        // 값 넘겨주고 나서 해당 유저의 newBadge 칼럼 초기화
                        return [4 /*yield*/, User.update({
                                newBadge: null
                            }, {
                                where: {
                                    id: user.id
                                }
                            })];
                    case 3:
                        // 값 넘겨주고 나서 해당 유저의 newBadge 칼럼 초기화
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        res.status(200).json({
                            isSuccess: true,
                            data: badges
                        });
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        records: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var id, weekdaysRecord, monthRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = res.locals.user.id;
                        return [4 /*yield*/, dateUtil.weekRecordInitChecking(id, dateUtil.koreanDate)];
                    case 1:
                        weekdaysRecord = _a.sent();
                        if (weekdaysRecord.msg) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "일치하는 유저 정보가 없습니다."
                                })];
                        }
                        return [4 /*yield*/, dateUtil.monthRecordInitChecking(id, dateUtil.koreanDate)];
                    case 2:
                        monthRecord = _a.sent();
                        if (monthRecord.msg) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "일치하는 유저 정보가 없습니다."
                                })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                isSuccess: true,
                                data: {
                                    weekdaysRecord: weekdaysRecord,
                                    monthRecord: monthRecord
                                }
                            })];
                }
            });
        }); })
    },
    "delete": {}
};

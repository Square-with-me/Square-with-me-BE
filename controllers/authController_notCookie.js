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
var passport = require("passport");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var methodForTs = function (req, res, next) { };
exports.methodForTs = methodForTs;
// utils
var _a = require("../utils/util"), regex = _a.regex, asyncWrapper = _a.asyncWrapper, createStatusMsg = _a.createStatusMsg;
var koreanDate = require("../utils/date").koreanDate;
// MySQL models
var _b = require("../models"), User = _b.User, Badge = _b.Badge;
// Mongo collections
var WeekRecord = require("../mongoSchemas/weekRecord");
var MonthRecord = require("../mongoSchemas/monthRecord");
module.exports = {
    create: {
        local: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, origin, nickname, pwd, isExistOrigin, isExistNickname, hashedPwd, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, origin = _a.origin, nickname = _a.nickname, pwd = _a.pwd;
                        if (!regex.checkEmail(origin)) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이메일 형식이 올바르지 않습니다."
                                })];
                        }
                        if (nickname.length < 2 || nickname.length > 8) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "닉네임은 2글자 ~ 8글자로 적어주세요."
                                })];
                        }
                        if (!regex.checkNickname(nickname)) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "닉네임에 특수문자를 사용할 수 없습니다."
                                })];
                        }
                        if (pwd.length < 8 || pwd.length > 16) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "비밀번호가 올바르지 않습니다."
                                })];
                        }
                        return [4 /*yield*/, User.findOne({
                                where: { origin: origin }
                            })];
                    case 1:
                        isExistOrigin = _b.sent();
                        if (isExistOrigin) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이미 존재하는 이메일입니다."
                                })];
                        }
                        return [4 /*yield*/, User.findOne({
                                where: { nickname: nickname }
                            })];
                    case 2:
                        isExistNickname = _b.sent();
                        if (isExistNickname) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이미 존재하는 닉네임입니다."
                                })];
                        }
                        hashedPwd = bcrypt.hashSync(pwd, 10);
                        return [4 /*yield*/, User.create({
                                origin: origin,
                                nickname: nickname,
                                pwd: hashedPwd,
                                statusMsg: createStatusMsg(),
                                type: "local",
                                lastUpdated: new Date()
                            })];
                    case 3:
                        user = _b.sent();
                        // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가
                        return [4 /*yield*/, WeekRecord.insertMany([
                                {
                                    userId: user.id,
                                    category: "beauty",
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                },
                                {
                                    userId: user.id,
                                    category: "sports",
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                },
                                {
                                    userId: user.id,
                                    category: "study",
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                },
                                {
                                    userId: user.id,
                                    category: "counseling",
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                },
                                {
                                    userId: user.id,
                                    category: "culture",
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                },
                                {
                                    userId: user.id,
                                    category: "etc",
                                    mon: 0,
                                    tue: 0,
                                    wed: 0,
                                    thur: 0,
                                    fri: 0,
                                    sat: 0,
                                    sun: 0
                                },
                            ])];
                    case 4:
                        // 회원가입 할 때 주/월 기록 테이블에 유저 레코드 추가
                        _b.sent();
                        return [4 /*yield*/, MonthRecord.insertMany([
                                { userId: user.id, date: 1, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 2, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 3, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 4, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 5, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 6, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 7, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 8, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 9, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 10, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 11, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 12, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 13, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 14, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 15, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 16, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 17, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 18, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 19, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 20, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 21, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 22, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 23, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 24, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 25, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 26, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 27, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 28, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 29, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 30, time: 0, lastUpdatedDate: koreanDate() },
                                { userId: user.id, date: 31, time: 0, lastUpdatedDate: koreanDate() },
                            ])];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, res.status(201).json({
                                isSuccess: true,
                                msg: "회원가입에 성공하였습니다."
                            })];
                }
            });
        }); }),
        kakao: function (req, res, next) {
            passport.authenticate("kakao", asyncWrapper(function (error, user) { return __awaiter(void 0, void 0, void 0, function () {
                var origin, token, firstComeBadge, isGivenBadge, leftBadge;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (error) {
                                return [2 /*return*/, res.status(500).json({
                                        isSuccess: false,
                                        msg: "카카오 로그인 오류"
                                    })];
                            }
                            origin = user.origin;
                            token = jwt.sign({ origin: origin }, process.env.JWT_SECRET_KEY);
                            return [4 /*yield*/, Badge.findOne({
                                    where: {
                                        name: "firstCome"
                                    }
                                })];
                        case 1:
                            firstComeBadge = _a.sent();
                            return [4 /*yield*/, user.getMyBadges({
                                    where: { id: firstComeBadge.id }
                                })];
                        case 2:
                            isGivenBadge = _a.sent();
                            leftBadge = firstComeBadge.leftBadges;
                            if (!(isGivenBadge.length === 0 && 0 < leftBadge)) return [3 /*break*/, 6];
                            return [4 /*yield*/, firstComeBadge.decrement("leftBadges")];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, user.addMyBadges(firstComeBadge.id)];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, user.update({ newBadge: firstComeBadge.id })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            res.status(200).json({
                                isSuccess: true,
                                data: {
                                    token: token
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            }); }))(req, res, next); // 미들웨어 확장
        }
    },
    get: {
        auth: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, origin, pwd, user, pwdCheck, token, firstComeBadge, isGivenBadge, leftBadge;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, origin = _a.origin, pwd = _a.pwd;
                        if (!origin || !pwd) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이메일 혹은 비밀번호를 입력하세요."
                                })];
                        }
                        return [4 /*yield*/, User.findOne({
                                where: { origin: origin }
                            })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이메일 혹은 비밀번호를 확인해주세요."
                                })];
                        }
                        pwdCheck = bcrypt.compareSync(pwd, user.pwd);
                        if (!pwdCheck) {
                            return [2 /*return*/, res.status(400).json({
                                    isSuccess: false,
                                    msg: "이메일 혹은 비밀번호를 확인해주세요."
                                })];
                        }
                        token = jwt.sign({ origin: origin }, process.env.JWT_SECRET_KEY);
                        return [4 /*yield*/, Badge.findOne({
                                where: {
                                    name: "firstCome"
                                }
                            })];
                    case 2:
                        firstComeBadge = _b.sent();
                        return [4 /*yield*/, user.getMyBadges({
                                where: { id: firstComeBadge.id }
                            })];
                    case 3:
                        isGivenBadge = _b.sent();
                        leftBadge = firstComeBadge.leftBadges;
                        if (!(isGivenBadge.length === 0 &&
                            user.type === "local" &&
                            0 < leftBadge)) return [3 /*break*/, 7];
                        return [4 /*yield*/, firstComeBadge.decrement("leftBadges")];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, user.addMyBadges(firstComeBadge.id)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, user.update({ newBadge: firstComeBadge.id })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, res.status(200).json({
                            isSuccess: true,
                            data: {
                                token: token
                            }
                        })];
                }
            });
        }); })
    },
    "delete": {
        auth: asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, res.status(200).json({
                        isSuccess: true
                    })];
            });
        }); })
    }
};

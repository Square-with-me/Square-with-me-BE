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
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
// models
var _a = require("../models"), User = _a.User, RefreshToken = _a.RefreshToken, Badge = _a.Badge;
var verifyToken = require("./jwt").verifyToken;
var asyncWrapper = require("./util").asyncWrapper;
var methodForTs = function (req, res, next) { };
exports.methodForTs = methodForTs;
// 쿠키 적용 시
module.exports = {
    auth: asyncWrapper(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var accessToken, refreshToken, currentRefreshToken, user, newAccessToken, user, newRefreshToken, expiredAt, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accessToken = verifyToken(req.cookies.accessToken);
                    refreshToken = verifyToken(req.cookies.refreshToken);
                    console.log(accessToken);
                    console.log(refreshToken);
                    console.log(req.cookies);
                    return [4 /*yield*/, RefreshToken.findOne({
                            where: { userId: refreshToken.id }
                        })];
                case 1:
                    currentRefreshToken = _a.sent();
                    if (currentRefreshToken.expiryDate.getTime() < new Date().getTime() || !refreshToken) { //만료되면 DB에서 지움, 쿠키에 토큰이 없어도 지움
                        RefreshToken.destroy({
                            where: { userId: refreshToken.id }
                        });
                    }
                    if (req.cookies.accessToken === undefined) {
                        return [2 /*return*/, res
                                .status(400)
                                .json({ isSuccess: false, msg: "API 사용 권한이 없습니다. 다시 로그인 해주세요." })];
                    }
                    if (!(accessToken === null)) return [3 /*break*/, 5];
                    if (!(refreshToken === undefined)) return [3 /*break*/, 2];
                    //access,refresh 둘 다 만료
                    return [2 /*return*/, res.status(400).json({
                            isSuccess: false,
                            msg: "API 사용 권한이 없습니다. 다시 로그인 해주세요."
                        })];
                case 2: return [4 /*yield*/, User.findOne({
                        where: { id: refreshToken.id }
                    })];
                case 3:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(400).json({ isSuccess: false, msg: "에러" })];
                    }
                    newAccessToken = jwt.sign({ origin: user.origin }, process.env.JWT_SECRET_KEY, {
                        expiresIn: '1h'
                    });
                    res.cookie("accessToken", newAccessToken, { httpOnly: true, sameSite: "lax" });
                    req.cookies.accessToken = newAccessToken;
                    _a.label = 4;
                case 4: return [3 /*break*/, 10];
                case 5:
                    if (!(refreshToken === undefined)) return [3 /*break*/, 8];
                    return [4 /*yield*/, User.findOne({
                            where: { origin: accessToken.origin }
                        })];
                case 6:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(400).json({ isSuccess: false, msg: "에러" })];
                    }
                    newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
                        expiresIn: '1d'
                    });
                    expiredAt = new Date();
                    expiredAt.setDate(expiredAt.getDate() + 1);
                    return [4 /*yield*/, RefreshToken.create({
                            token: newRefreshToken,
                            userId: user.id,
                            expiryDate: expiredAt.getTime()
                        })];
                case 7:
                    _a.sent();
                    res.cookie("refreshToken", newRefreshToken, { httpOnly: true, sameSite: "lax" });
                    req.cookies.refreshToken = newRefreshToken;
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, User.findOne({
                        where: { origin: accessToken.origin },
                        attributes: ["id", "origin", "nickname", "profileImg", "statusMsg", "type"],
                        include: [{
                                model: Badge,
                                as: "MasterBadge",
                                attributes: ["id", "name", "imageUrl"]
                            }]
                    })];
                case 9:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(400).json({ isSuccess: false, msg: "서버내부에러" })];
                    }
                    res.locals.user = user;
                    _a.label = 10;
                case 10:
                    next();
                    return [2 /*return*/];
            }
        });
    }); })
};
// Authorization 적용 시
module.exports = {
    auth: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var authorization, _a, type, value, origin_1, user, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    authorization = req.headers.authorization;
                    if (!authorization) {
                        return [2 /*return*/, res.status(400).json({
                                isSuccess: false,
                                msg: "토큰 정보가 없습니다."
                            })];
                    }
                    ;
                    _a = authorization.split(" "), type = _a[0], value = _a[1];
                    if (type !== "Bearer") {
                        return [2 /*return*/, res.status(400).json({
                                isSuccess: false,
                                msg: "유효하지 않은 타입의 토큰입니다."
                            })];
                    }
                    ;
                    if (!value) {
                        return [2 /*return*/, res.status(400).json({
                                isSuccess: false,
                                msg: "토큰이 없습니다."
                            })];
                    }
                    ;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    origin_1 = jwt.verify(value, process.env.JWT_SECRET_KEY).origin;
                    return [4 /*yield*/, User.findOne({
                            where: { origin: origin_1 },
                            attributes: ["id", "origin", "nickname", "profileImg", "statusMsg"],
                            include: [{
                                    model: Badge,
                                    as: "MasterBadge",
                                    attributes: ["id", "name", "imageUrl"]
                                }]
                        })];
                case 2:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(400).json({
                                isSuccess: false,
                                msg: "유효한 값의 토큰이 아닙니다."
                            })];
                    }
                    ;
                    res.locals.user = user;
                    next();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error(error_1);
                    return [2 /*return*/, res.status(500).json({
                            isSuccess: false,
                            msg: "Internal Server Error"
                        })];
                case 4:
                    ;
                    return [2 /*return*/];
            }
        });
    }); }
};

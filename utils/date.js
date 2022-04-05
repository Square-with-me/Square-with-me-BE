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
var _this = this;
// models
var User = require("../models").User;
// Mongo DB 시간기록
var WeekRecord = require("../mongoSchemas/weekRecord");
var MonthRecord = require("../mongoSchemas/monthRecord");
module.exports = {
    koreanDate: function () {
        // 1. 현재 PC 표준 시간
        var curr = new Date();
        // 2. UTC 시간 계산
        var utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
        // 3. UTC to KST (UTC + 9시간)
        var KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        var kr_curr = new Date(utc + KR_TIME_DIFF);
        return kr_curr;
    },
    weekRecordInitChecking: function (id, krToday) { return __awaiter(_this, void 0, void 0, function () {
        var weekdaysRecord, user, lastUpdatedDate, checkingDate, oneDay, lastUpdatedZeroHour, checkingZeroHour, numLUZ, numCZH;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, WeekRecord.find({ userId: id }, { _id: 0, __v: 0 })];
                case 1:
                    weekdaysRecord = _a.sent();
                    if (weekdaysRecord.length === 0) {
                        return [2 /*return*/, { msg: "일치하는 유저 정보가 없습니다." }];
                    }
                    return [4 /*yield*/, User.findOne({
                            where: {
                                id: id
                            }
                        })];
                case 2:
                    user = _a.sent();
                    lastUpdatedDate = user.lastUpdated;
                    checkingDate = krToday();
                    oneDay = 86400000;
                    lastUpdatedZeroHour = new Date(lastUpdatedDate.getFullYear(), lastUpdatedDate.getMonth(), lastUpdatedDate.getDate(), 0);
                    checkingZeroHour = new Date(checkingDate.getFullYear(), checkingDate.getMonth(), checkingDate.getDate(), 0);
                    numLUZ = Number(lastUpdatedDate);
                    numCZH = Number(checkingZeroHour);
                    if (!(checkingZeroHour.getDay() === 0)) return [3 /*break*/, 7];
                    if (!(numLUZ <= numCZH - 7 * oneDay || // 주가 다를 때
                        numCZH + 1 * oneDay <= numLUZ)) return [3 /*break*/, 6];
                    // 요일 초기화 실행
                    return [4 /*yield*/, User.update({ lastUpdated: checkingDate }, { where: { id: id } })];
                case 3:
                    // 요일 초기화 실행
                    _a.sent();
                    // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
                    return [4 /*yield*/, WeekRecord.updateMany({ userId: id }, {
                            $set: { mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0 }
                        })];
                case 4:
                    // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
                    _a.sent();
                    return [4 /*yield*/, WeekRecord.find({ userId: id }, { _id: 0, __v: 0 })];
                case 5:
                    weekdaysRecord = _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 11];
                case 7:
                    if (!(numLUZ <= numCZH - checkingZeroHour.getDay() * oneDay ||
                        numCZH + (8 - checkingZeroHour.getDay()) * oneDay <= numLUZ)) return [3 /*break*/, 11];
                    // 요일 초기화 실행
                    return [4 /*yield*/, User.update({ lastUpdated: checkingDate }, { where: { id: id } })];
                case 8:
                    // 요일 초기화 실행
                    _a.sent();
                    // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
                    return [4 /*yield*/, WeekRecord.updateMany({ userId: id }, {
                            $set: { mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0 }
                        })];
                case 9:
                    // 원하는 행들을 찾아서 해당 행들의 데이터 변경, 변경된 데이터를 반환
                    _a.sent();
                    return [4 /*yield*/, WeekRecord.find({ userId: id }, { _id: 0, __v: 0 })];
                case 10:
                    weekdaysRecord = _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/, weekdaysRecord];
            }
        });
    }); },
    monthRecordInitChecking: function (id, krToday) { return __awaiter(_this, void 0, void 0, function () {
        var monthRecord, checkingDate, lastUpdatedMonth, checkingMonth;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, MonthRecord.find({ userId: id }, { _id: 0, __v: 0 })];
                case 1:
                    monthRecord = _a.sent();
                    if (monthRecord.length === 0) {
                        return [2 /*return*/, { msg: "일치하는 유저 정보가 없습니다." }];
                    }
                    checkingDate = krToday();
                    lastUpdatedMonth = monthRecord[0].lastUpdatedDate.getMonth() + 1;
                    checkingMonth = checkingDate.getMonth() + 1;
                    if (!(lastUpdatedMonth !== checkingMonth || // 달이 다르거나
                        monthRecord[0].lastUpdatedDate.getFullYear() !==
                            checkingDate.getFullYear()) // 연도가 다를 때
                    ) return [3 /*break*/, 4]; // 연도가 다를 때
                    return [4 /*yield*/, MonthRecord.updateMany({ userId: id }, { $set: { time: 0, lastUpdatedDate: checkingDate } })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, MonthRecord.find({ userId: id }, { _id: 0, __v: 0 })];
                case 3:
                    monthRecord = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, monthRecord];
            }
        });
    }); }
};

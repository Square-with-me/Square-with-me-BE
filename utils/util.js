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
var v4 = require("uuid").v4;
var multer = require("multer");
var path = require("path");
var multerS3 = require("multer-s3");
var AWS = require("aws-sdk");
// AWS Config
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-northeast-2"
});
var methodForTs = function (req, res, next) { };
exports.methodForTs = methodForTs;
module.exports = {
    regex: {
        checkEmail: function (email) {
            var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
            var isValid = regex.test(email);
            return isValid;
        },
        checkNickname: function (nickname) {
            var regex = /[!@#$%^&*()_\-+=~`{}\[\]\\|"':;<>,.\/?]/g;
            var isValid = !nickname.match(regex);
            return isValid ? true : false;
        }
    },
    asyncWrapper: function (asyncFn) {
        return (function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, asyncFn(req, res, next)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, res.status(500).json({
                                isSuccess: false,
                                msg: "Internal Server Error"
                            })];
                    case 3:
                        ;
                        return [2 /*return*/];
                }
            });
        }); });
    },
    createStatusMsg: function () {
        var msgs = [
            "오늘도 아자아자!!",
            "밤하늘의 별..2 되고ㅍr",
            "오늘도.. 나는 고독과 싸운다.",
            "너와 함께라면 할 수 잇어!!",
            "너 나 우리.. 모두의 힘을 모아",
            "실패란 뭘까... 알고싶어..^;",
            "실패는 성공의 어머니!",
            "두렵냐? 나도 두렵다.. 함께하자!!",
        ];
        var length = msgs.length;
        var randomIdx = Math.floor(Math.random() * length);
        return msgs[randomIdx];
    },
    // 해당 날짜의 요일 가져오기
    getDay: function (date) {
        var map = {
            0: "sun",
            1: "mon",
            2: "tue",
            3: "wed",
            4: "thur",
            5: "fri",
            6: "sat"
        };
        var fullDate = new Date();
        fullDate.setDate(date); // date(ex: 23일이면 23) 넣으면 해당 날짜로 설정
        var day = map[fullDate.getDay()]; // 해당 날짜의 요일 가져와서 문자로 치환
        return day;
    },
    s3Upload: multer({
        storage: multerS3({
            s3: new AWS.S3(),
            bucket: "square-with-me-bucket",
            key: function (req, file, cb) {
                cb(null, "images/".concat(Date.now(), "_").concat(path.basename(file.originalname)));
            }
        })
    })
};

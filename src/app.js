"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var typeorm_1 = require("typeorm");
var User_1 = require("./entity/User");
var Event_1 = require("./entity/Event");
var Ticket_1 = require("./entity/Ticket");
var uuid_1 = require("uuid");
var cors = require("cors");
var mailsender_1 = require("./utils/mailsender");
var qrcode_1 = require("./config/qrcode");
// create typeorm connection
var isAuthenticated = function (email, password, userRepository) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, userRepository
                    .createQueryBuilder("User")
                    .where("User.email = :email", { email: email })
                    .getOne()];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, false];
                }
                if (user.password !== password) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
        }
    });
}); };
(0, typeorm_1.createConnection)().then(function (connection) {
    // create and setup express app
    var app = express();
    app.use(express.json());
    app.use(cors({
        origin: "*",
    }));
    var userRepository = connection.getRepository(User_1.User);
    var eventsRepository = connection.getRepository(Event_1.Event);
    var ticketsRepository = connection.getRepository(Ticket_1.Ticket);
    // register routes
    // app.get("/users", async function (req: Request, res: Response) {
    //   const users = await userRepository.find();
    //   res.json(users);
    // });
    // app.get("/users/:id", async function (req: Request, res: Response) {
    //   const results = await userRepository.findOneById(req.params.id);
    //   return res.send(results);
    // });
    app.post("/registration", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, userRepository.save(req.body)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res.send(true)];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.post("/authentication", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = (_a = res).send;
                        return [4 /*yield*/, isAuthenticated(req.body.email, req.body.password, userRepository)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    case 2:
                        error_2 = _c.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    // app.put("/users/:id", async function (req: Request, res: Response) {
    //   const user = await userRepository.findOneById(req.params.id);
    //   userRepository.merge(user, req.body);
    //   const results = await userRepository.save(user);
    //   return res.send(results);
    // });
    // app.delete("/users/:id", async function (req: Request, res: Response) {
    //   const results = await userRepository.delete(req.params.id);
    //   return res.send(results);
    // });
    // Events
    app.get("/events", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var events, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, eventsRepository.find()];
                    case 1:
                        events = _a.sent();
                        res.json(events);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.get("/events/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var event_1, tickets, updatedTickets, entityManager, _i, tickets_1, ticket, response, user, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, eventsRepository.findOneById(req.params.id)];
                    case 1:
                        event_1 = _a.sent();
                        return [4 /*yield*/, ticketsRepository
                                .createQueryBuilder("Ticket")
                                .where("Ticket.eventId = :eventId", { eventId: event_1.id })
                                .getMany()];
                    case 2:
                        tickets = _a.sent();
                        updatedTickets = [];
                        entityManager = (0, typeorm_1.getManager)();
                        _i = 0, tickets_1 = tickets;
                        _a.label = 3;
                    case 3:
                        if (!(_i < tickets_1.length)) return [3 /*break*/, 7];
                        ticket = tickets_1[_i];
                        return [4 /*yield*/, entityManager.query("SELECT t.userId FROM ticket as t WHERE t.id = ?", [ticket.id])];
                    case 4:
                        response = _a.sent();
                        return [4 /*yield*/, userRepository.findOneById(response[0].userId)];
                    case 5:
                        user = _a.sent();
                        updatedTickets.push(__assign(__assign({}, ticket), { name: user.name }));
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7:
                        console.log(JSON.stringify(updatedTickets));
                        return [2 /*return*/, res.send(__assign(__assign({}, event_1), { tickets: updatedTickets }))];
                    case 8:
                        error_4 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    });
    app.post("/events", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, payload, user, event_2, _b, _c, error_5, error_6;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        _a = req.body, email = _a.email, password = _a.password, payload = __rest(_a, ["email", "password"]);
                        if (!isAuthenticated(email, password, userRepository)) {
                            return [2 /*return*/, res.status(401).send({ message: "Nu esti autentificat!" })];
                        }
                        return [4 /*yield*/, userRepository
                                .createQueryBuilder("User")
                                .where("User.email = :email", { email: email })
                                .getOne()];
                    case 1:
                        user = _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, eventsRepository.save(__assign(__assign({}, payload), { owner: email, user: user, state: 0 }))];
                    case 3:
                        event_2 = _d.sent();
                        if (!payload.banner) return [3 /*break*/, 6];
                        return [4 /*yield*/, eventsRepository.update(event_2.id, {
                                banner: "".concat(event_2.id, "/").concat(payload.banner),
                            })];
                    case 4:
                        _d.sent();
                        _c = (_b = res).send;
                        return [4 /*yield*/, eventsRepository.findOneById(event_2.id)];
                    case 5: return [2 /*return*/, _c.apply(_b, [_d.sent()])];
                    case 6: return [2 /*return*/, res.send(event_2)];
                    case 7:
                        error_5 = _d.sent();
                        console.log(error_5);
                        return [2 /*return*/, res
                                .status(400)
                                .send({ message: "eroare la adaugarea evenimentului" })];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_6 = _d.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    });
    // app.put("/event/:id", async function (req: Request, res: Response) {
    //   const event = await eventsRepository.findOneById(req.params.id);
    //   eventsRepository.merge(event, req.body);
    //   const results = await eventsRepository.save(event);
    //   return res.send(results);
    // });
    // app.delete("/events/:id", async function (req: Request, res: Response) {
    //   const results = await eventsRepository.delete(req.params.id);
    //   return res.send(results);
    // });
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    app.get("/tickets", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var ticket, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ticketsRepository.find()];
                    case 1:
                        ticket = _a.sent();
                        res.json(ticket);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.get("/tickets/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ticketsRepository.findOneById(req.params.id)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                    case 2:
                        error_8 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.patch("/tickets/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var newState, ticket, updatedTicket, entityManager, response, userId, user, qrLink, userEmail, qr, mail, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        newState = req.body.state;
                        return [4 /*yield*/, ticketsRepository.findOneById(req.params.id)];
                    case 1:
                        ticket = _a.sent();
                        return [4 /*yield*/, ticketsRepository.save(__assign(__assign({}, ticket), { state: newState }))];
                    case 2:
                        updatedTicket = _a.sent();
                        entityManager = (0, typeorm_1.getManager)();
                        return [4 /*yield*/, entityManager.query("SELECT t.userId FROM ticket as t WHERE t.id = ?", [ticket.id])];
                    case 3:
                        response = _a.sent();
                        console.log(JSON.stringify(response));
                        userId = response[0].userId;
                        if (!(newState === 1)) return [3 /*break*/, 7];
                        return [4 /*yield*/, userRepository.findOneById(userId)];
                    case 4:
                        user = _a.sent();
                        qrLink = "http://localhost:3005/validare-bilet/".concat(ticket.secretCode);
                        userEmail = user.email;
                        return [4 /*yield*/, (0, qrcode_1.generateQR)(qrLink)];
                    case 5:
                        qr = _a.sent();
                        qr = qr.replace(/^data:image\/(png|jpg);base64,/, "");
                        mail = {
                            from: "EventsApp",
                            to: userEmail,
                            subject: "Event attendance pass",
                            attachments: [
                                {
                                    filename: "Ticket.jpg",
                                    content: qr,
                                    encoding: "base64",
                                },
                            ],
                            text: "Send email",
                        };
                        return [4 /*yield*/, mailsender_1.transporter.sendMail(mail, function (err, data) {
                                if (err) {
                                    res.send({
                                        status: "fail",
                                        error: err,
                                    });
                                }
                                else {
                                    res.json({
                                        status: "success",
                                    });
                                }
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, res.send(updatedTicket)];
                    case 8:
                        error_9 = _a.sent();
                        console.log(error_9);
                        return [2 /*return*/, res.status(500).send(false)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    });
    app.post("/tickets", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, payload, user, event_3, ticket, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = req.body, email = _a.email, password = _a.password, payload = __rest(_a, ["email", "password"]);
                        if (!isAuthenticated(email, password, userRepository)) {
                            return [2 /*return*/, res.status(401).send({ message: "Nu esti autentificat!" })];
                        }
                        return [4 /*yield*/, userRepository
                                .createQueryBuilder("User")
                                .where("User.email = :email", { email: email })
                                .getOne()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, eventsRepository.findOneById(payload.eventId)];
                    case 2:
                        event_3 = _b.sent();
                        return [4 /*yield*/, ticketsRepository.save(__assign(__assign({}, payload), { secretCode: (0, uuid_1.v4)(), state: 0, user: user, event: event_3 }))];
                    case 3:
                        ticket = _b.sent();
                        return [2 /*return*/, res.send(ticket)];
                    case 4:
                        error_10 = _b.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
    app.put("/tickets/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var ticket, results, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ticketsRepository.findOneById(req.params.id)];
                    case 1:
                        ticket = _a.sent();
                        ticketsRepository.merge(ticket, req.body);
                        return [4 /*yield*/, ticketsRepository.save(ticket)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                    case 3:
                        error_11 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    app.delete("/tickets/:id", function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ticketsRepository.delete(req.params.id)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, res.send(results)];
                    case 2:
                        error_12 = _a.sent();
                        return [2 /*return*/, res.status(500).send(false)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    app.listen(3001);
});

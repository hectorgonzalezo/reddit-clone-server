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
const users = require('../../routes/users');
const request = require("supertest");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use("/", users);
describe("All users", () => {
    test("GET Returns a list of all users in database", (done) => {
        request(app)
            .get('/')
            .expect("Content-Type", /json/)
            .expect({ users: "users" })
            .expect(200, done);
    });
});
describe("Single user", () => {
    test("Return a list of all users in database", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app).get('/1234');
        expect(res.status).toEqual(200);
        expect(/.+\/json/.test(res.type)).toBe(true);
        expect(res.body).toEqual({ user: "User 1234" });
    }));
});
//# sourceMappingURL=users.test.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
const type_graphql_1 = require("type-graphql");
const constant_1 = require("../constant");
const User_1 = require("../entities/User");
const token_1 = require("../models/token");
const ForgotPassword_1 = require("../types/ForgotPassword");
const LoginInput_1 = require("../types/LoginInput");
const RegisterInput_1 = require("../types/RegisterInput");
const UserMutationResponse_1 = require("../types/UserMutationResponse");
const sendEmail_1 = require("../utils/sendEmail");
const validateRegisterInput_1 = require("../utils/validateRegisterInput");
const uuid_1 = require("uuid");
const ChangePasswordInput_1 = require("../types/ChangePasswordInput");
let UserResolver = class UserResolver {
    //check the user have login or not
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId)
                return null;
            const user = yield User_1.User.findOne(req.session.userId);
            return user;
        });
    }
    //String nay la String cua graphQL
    register(registerInput, { req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            const validateRegisterInputErrors = (0, validateRegisterInput_1.validateRegisterInput)(registerInput);
            if (validateRegisterInputErrors !== null)
                return Object.assign({ code: 400, success: false }, validateRegisterInputErrors);
            try {
                const { username, email, password } = registerInput;
                const existingUser = yield User_1.User.findOne({
                    //check both username and email
                    where: [{ username }, { email }],
                });
                if (existingUser)
                    return {
                        code: 400,
                        success: false,
                        message: "Duplicate username or email",
                        errors: [
                            {
                                field: existingUser.username === username ? "username" : "email",
                                message: `${existingUser.username === username ? "Username" : "email"} already taken`,
                            },
                        ],
                    };
                const hashedPassword = yield argon2_1.default.hash(password);
                let newUser = User_1.User.create({
                    username,
                    password: hashedPassword,
                    email,
                });
                yield User_1.User.save(newUser);
                //phai dat newUser len truoc de newUser co id thi moi lay duoc id do
                req.session.userId = newUser.id;
                return {
                    code: 200,
                    success: true,
                    message: "User registration successfully",
                    user: newUser,
                };
            }
            catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error`,
                };
            }
        });
    }
    login({ usernameOrEmail, password }, 
    //ctx chinh la context, lay req va res tu context o apolloserver
    { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield User_1.User.findOne(usernameOrEmail.includes("@")
                    ? { email: usernameOrEmail }
                    : { username: usernameOrEmail });
                if (!existingUser)
                    return {
                        code: 400,
                        success: false,
                        message: "User not found",
                        errors: [
                            {
                                field: "usernameoremail",
                                message: "Username or email incorrect",
                            },
                        ],
                    };
                const passwordValid = yield argon2_1.default.verify(existingUser.password, password); //value 1 is the value in database, value 2 is the input value
                if (!passwordValid)
                    return {
                        code: 400,
                        success: false,
                        message: "Wrong password",
                        errors: [{ field: "password", message: "Incorrect password" }],
                    };
                //create Session and then return cookie anytime have one user login successfully
                //userId of session that was created in Context file
                req.session.userId = existingUser.id;
                return {
                    code: 200,
                    success: true,
                    message: "Login successfully",
                    user: existingUser,
                };
            }
            catch (error) {
                console.log(error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error`,
                };
            }
        });
    }
    logout({ req, res }) {
        //de gach chan o duoi reject do minh k can toi no
        //phai dat no vao mo promise vi trong ham destroy yeu cau mot callback
        return new Promise((resolve, _reject) => {
            res.clearCookie(constant_1.COOKIE_NAME);
            req.session.destroy((error) => {
                if (error) {
                    console.log(" DESTROY SESSION ERROR", error);
                    resolve(false);
                }
                resolve(true);
                console.log("Finish logout");
            });
        });
    }
    forgotPassword(forgotPasswordInput) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ email: forgotPasswordInput.email });
            if (!user)
                return true;
            yield token_1.TokenModel.findOneAndDelete({ userId: `${user.id}` });
            const resetToken = (0, uuid_1.v4)();
            //k duoc phep de lo ra token tran trui
            //hash token giong nhu password
            const hasedToken = yield argon2_1.default.hash(resetToken);
            yield new token_1.TokenModel({ userId: `${user.id}`, token: hasedToken }).save();
            //tra ve cho ng dung thi duoc phep tra token goc 
            yield (0, sendEmail_1.sendEmail)(forgotPasswordInput.email, `<a href='http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}'>Click to here to change password</a>`);
            return true;
        });
    }
    changePassword(token, userId, changePasswordInput, { req }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = changePasswordInput.newPassword) === null || _a === void 0 ? void 0 : _a.length) <= 2) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid password',
                    errors: [
                        {
                            field: 'newPassword',
                            message: 'Length must be greater than 2'
                        }
                    ]
                };
            }
            try {
                //tim token ma trung voi cai userId do 
                const resetPasswordTokenRecord = yield token_1.TokenModel.findOne({ userId });
                if (!resetPasswordTokenRecord) {
                    return {
                        code: 400,
                        success: false,
                        message: 'Invalid or expired password reset token',
                        errors: [
                            {
                                field: 'token',
                                message: 'Invalid or expired token'
                            }
                        ]
                    };
                }
                //token nay chinh la token lay vao tu phia input ma ta truyen vao arg o tren 
                const resetPasswordTokenValid = argon2_1.default.verify(resetPasswordTokenRecord.token, token);
                if (!resetPasswordTokenValid)
                    return {
                        code: 400,
                        success: false,
                        message: 'Invalid or expired password reset token',
                        errors: [
                            {
                                field: 'token',
                                message: 'Invalid or expired token'
                            }
                        ]
                    };
                //parseInt tai vi gia tri luu trong mongoDB la string nen can phai parseInt
                const userIdNum = parseInt(userId);
                const user = yield User_1.User.findOne(userIdNum); //se tim hai cai id giong nhau o mongoDB va postgre
                if (!user)
                    return {
                        code: 400,
                        success: false,
                        message: 'User no longer available',
                        errors: [
                            {
                                field: 'user error',
                                message: 'User no longer exist'
                            }
                        ]
                    };
                const updatedPassword = yield argon2_1.default.hash(changePasswordInput.newPassword);
                yield User_1.User.update({ id: userIdNum }, { password: updatedPassword });
                yield resetPasswordTokenRecord.deleteOne();
                req.session.userId = user.id;
                return {
                    code: 200,
                    success: true,
                    message: 'User password reset successfully',
                    user: user
                };
            }
            catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error`,
                };
            }
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)((_return) => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("registerInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("loginInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => Boolean),
    __param(0, (0, type_graphql_1.Arg)('forgotPasswordInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPassword_1.ForgotPasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('userId')),
    __param(2, (0, type_graphql_1.Arg)('changePasswordInput')),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ChangePasswordInput_1.ChangePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;

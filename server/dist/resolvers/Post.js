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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const CreatePostInput_1 = require("../types/CreatePostInput");
const PostMutationResponse_1 = require("../types/PostMutationResponse");
const updatePostInput_1 = require("../types/updatePostInput");
const User_1 = require("../entities/User");
const PaginatedPosts_1 = require("../types/PaginatedPosts");
const typeorm_1 = require("typeorm");
//boi vi co 2 resover o day nen can phai khai bao dang tra ve cho resolver, o day dang tra ve cho textSnippet la Post vay nen phai khai bao cho th Resolver dau tien
let PostResolver = class PostResolver {
    //FieldResolver dong vai tro nhu mot gia tri moi trong entities nen k can phai khai bao trong entities nua
    //@Root de goi lai gia tri ve Post
    textSnippet(root) {
        return root.text.slice(0, 50);
        //cat chu do ra va chi lay 50 ky tu dau tien
    }
    //vi trong
    user(rootPost) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield User_1.User.findOne(rootPost.userId);
        });
    }
    createPost({ title, text }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newPost = Post_1.Post.create({
                    title,
                    text,
                    userId: req.session.userId
                });
                yield newPost.save();
                return {
                    code: 200,
                    success: true,
                    message: "Post created successfully",
                    post: newPost,
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
    posts(limit, cursor) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalPostCount = yield Post_1.Post.count();
                //Neu tren 10 thi se lay la 10, con duoi 10 thi se lay la limit
                const realLimit = Math.min(10, limit);
                //khai bao nhu nay doi voi typescript thi se k y kien, vi findOptions chi co 2 gia tri la order va take nhung o cursor thi findOption lai cham den cai khac
                const findOptions = {
                    order: {
                        createdAt: "DESC",
                    },
                    take: realLimit,
                };
                let lastPost = [];
                //Neu truyen tham so cursor vao thi cai ngay ma hien thi ra phai be hon cai cursor do va sap xep theo thu tu DESC
                if (cursor) {
                    findOptions.where = { createdAt: (0, typeorm_1.LessThan)(cursor) };
                    lastPost = yield Post_1.Post.find({
                        order: {
                            createdAt: "ASC",
                        },
                        take: 1,
                    });
                }
                const posts = yield Post_1.Post.find(findOptions);
                return {
                    totalCount: totalPostCount,
                    cursor: posts[posts.length - 1].createdAt,
                    //tra ve true neu post cuoi cung ma chung ta lay khac voi post cuoi cung o trong database
                    //tra ve true nghia la con post de loading them
                    hasMore: cursor
                        ? ((_a = posts[posts.length - 1].createdAt) === null || _a === void 0 ? void 0 : _a.toString()) !== ((_b = lastPost[0].createdAt) === null || _b === void 0 ? void 0 : _b.toString())
                        : posts.length !== totalPostCount,
                    paginatedPosts: posts,
                };
            }
            catch (err) {
                return null;
            }
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Post_1.Post.findOne(id);
            }
            catch (error) {
                return undefined;
            }
        });
    }
    updatePost({ id, title, text }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingPost = yield Post_1.Post.findOne(id);
                if (!existingPost)
                    return {
                        code: 400,
                        success: false,
                        message: "Post not found",
                    };
                //kp user do ma cap nhat post cua user do
                if (existingPost.userId !== req.session.userId) {
                    return {
                        code: 401,
                        success: false,
                        message: "Unauthorized"
                    };
                }
                existingPost.title = title;
                existingPost.text = text;
                yield existingPost.save();
                return {
                    code: 200,
                    success: true,
                    message: "update successfully",
                    post: existingPost,
                };
            }
            catch (_a) {
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error`,
                };
            }
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Request session", req.session);
            const existingPost = yield Post_1.Post.findOne(id);
            if (!existingPost)
                return {
                    code: 400,
                    success: false,
                    message: "Post not found",
                };
            //kp user do ma cap nhat post cua user do
            if (existingPost.userId !== req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: "Unauthorized"
                };
            }
            yield Post_1.Post.delete({ id }); //tham so id ma can delete se bang id cua id truyen vao
            return {
                code: 200,
                success: true,
                message: "Post deleted successfully",
            };
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)((_return) => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)((_return) => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("createPostInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePostInput_1.CreatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => PaginatedPosts_1.PaginatedPosts, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("limit", (_type) => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("cursor", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", _type => type_graphql_1.ID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("updatePostInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePostInput_1.UpdatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)("id", _type => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)((_of) => Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;

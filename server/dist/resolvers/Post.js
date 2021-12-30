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
let PostResolver = class PostResolver {
    createPost({ title, text }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newPost = Post_1.Post.create({
                    title,
                    text
                });
                yield newPost.save();
                return {
                    code: 200,
                    success: true,
                    message: 'Post created successfully',
                    post: newPost
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
    posts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return Post_1.Post.find();
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
    updatePost({ id, title, text }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingPost = yield Post_1.Post.findOne(id);
                if (!existingPost)
                    return {
                        code: 400,
                        success: false,
                        message: 'Post not found'
                    };
                existingPost.title = title;
                existingPost.text = text;
                yield existingPost.save();
                return {
                    code: 200,
                    success: true,
                    message: 'update successfully',
                    post: existingPost
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
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingPost = yield Post_1.Post.findOne(id);
                if (!existingPost)
                    return {
                        code: 400,
                        success: false,
                        message: 'Post not found'
                    };
                yield Post_1.Post.delete({ id }); //tham so id ma can delete se bang id cua id truyen vao 
                return {
                    code: 200,
                    success: true,
                    message: 'Post deleted successfully'
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
    (0, type_graphql_1.Mutation)(_return => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('createPostInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePostInput_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Query)(_return => [Post_1.Post], { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(_return => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('updatePostInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePostInput_1.UpdatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => PostMutationResponse_1.PostMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
exports.PostResolver = PostResolver;

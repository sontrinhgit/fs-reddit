import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { CreatePostInput } from "../types/CreatePostInput";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { UpdatePostInput } from "../types/updatePostInput";
import { checkAuth } from "../middleware/checkAuth";
import { Context } from "../types/Context";
import { AuthenticationError } from "apollo-server-core";
import { User } from "../entities/User";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { LessThan } from "typeorm";
import session from 'express-session';

//boi vi co 2 resover o day nen can phai khai bao dang tra ve cho resolver, o day dang tra ve cho textSnippet la Post vay nen phai khai bao cho th Resolver dau tien
@Resolver((_of) => Post)
export class PostResolver {
  //FieldResolver dong vai tro nhu mot gia tri moi trong entities nen k can phai khai bao trong entities nua
  @FieldResolver((_return) => String)
  //@Root de goi lai gia tri ve Post
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
    //cat chu do ra va chi lay 50 ky tu dau tien
  }

  //vi trong

  @FieldResolver((_return) => User)
  //xet la async boi vi can noi chuyen voi database
  async user(@Root() rootPost: Post) {
    return await User.findOne(rootPost.userId);
  }

  @Mutation((_return) => PostMutationResponse)
 
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput,
    @Ctx() {req}: Context
 
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
        userId: req.session.userId
      });

      await newPost.save();
      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: newPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error`,
      };
    }
  }

  @Query((_return) => PaginatedPosts, { nullable: true })
  //limit nay o phia typescript se la number con o phia graphQL se la Int
  async posts(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPostCount = await Post.count();
      //Neu tren 10 thi se lay la 10, con duoi 10 thi se lay la limit
      const realLimit = Math.min(10, limit);

      //khai bao nhu nay doi voi typescript thi se k y kien, vi findOptions chi co 2 gia tri la order va take nhung o cursor thi findOption lai cham den cai khac
      const findOptions: { [key: string]: any } = {
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
      };

      let lastPost: Post[] = [];

      //Neu truyen tham so cursor vao thi cai ngay ma hien thi ra phai be hon cai cursor do va sap xep theo thu tu DESC
      if (cursor) {
        findOptions.where = { createdAt: LessThan(cursor) };

        lastPost = await Post.find({
          order: {
            createdAt: "ASC",
          },
          take: 1,
        });
      }
      const posts = await Post.find(findOptions);
      return {
        totalCount: totalPostCount,
        cursor: posts[posts.length - 1].createdAt as Date,
        //tra ve true neu post cuoi cung ma chung ta lay khac voi post cuoi cung o trong database
        //tra ve true nghia la con post de loading them
        hasMore: cursor
          ? posts[posts.length - 1].createdAt?.toString() !== lastPost[0].createdAt?.toString()
          : posts.length !== totalPostCount,
        paginatedPosts: posts,
      };
    } catch (err) {
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  //_type nay de dinh dang them cho ID o graphQL, neu k se default la float hoac integer
  async post(@Arg("id", _type => ID) id:number): Promise<Post | undefined> {
    try {
      return await Post.findOne(id);
    } catch (error) {
      return undefined;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  async updatePost(
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput,
    @Ctx() {req}: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne(id);
      if (!existingPost)
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };

        //kp user do ma cap nhat post cua user do
        if(existingPost.userId !== req.session.userId) 
        {
            return {
                code: 401, 
                success: false,
                message: "Unauthorized"
            }
        }

      existingPost.title = title;
      existingPost.text = text;

      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: "update successfully",
        post: existingPost,
      };
    } catch {
      return {
        code: 500,
        success: false,
        message: `Internal server error`,
      };
    }
  }

  @Mutation((_return) => PostMutationResponse)
  //where want to use MiddleWare to check just need to add Middleware
  //vai tro nhu bac bao ve, kiem tra xem nguoi dung da dang nhap hay chua thong qua session
  // @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", _type => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    console.log("Request session", req.session);

    const existingPost = await Post.findOne(id);
    if (!existingPost)
      return {
        code: 400,
        success: false,
        message: "Post not found",
      };

        //kp user do ma cap nhat post cua user do
        if(existingPost.userId !== req.session.userId) 
        {
            return {
                code: 401, 
                success: false,
                message: "Unauthorized"
            }
        }

    await Post.delete({ id }); //tham so id ma can delete se bang id cua id truyen vao
    return {
      code: 200,
      success: true,
      message: "Post deleted successfully",
    };
  }
}

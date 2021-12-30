import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { Post } from '../entities/Post';
import { CreatePostInput } from "../types/CreatePostInput";
import { PostMutationResponse } from '../types/PostMutationResponse';
import { UpdatePostInput } from '../types/updatePostInput';


@Resolver()
export class PostResolver {
    @Mutation (_return => PostMutationResponse)
    async createPost(@Arg('createPostInput') {title,text}: CreatePostInput) : Promise<PostMutationResponse> {
        try {
            const newPost = Post.create({
                title,
                text
            })
    
            await newPost.save()
            return {
                code: 200,
                success: true,
                message: 'Post created successfully',
                post: newPost
            }
        } catch(error) {
            return {
                code: 500,
                success: false,
                message: `Internal server error`,
            }
        }
    
    }


    @Query(_return => [Post], {nullable: true})
    async posts(): Promise<Post[] | null> {
        try {
            return Post.find()
        } catch (err) {
            return null
        }
        
    }

    @Query(_return => Post, {nullable: true})
    //_type nay de dinh dang them cho ID o graphQL, neu k se default la float hoac integer 
    async post(@Arg('id') id:number): Promise<Post | undefined> {

        try {
            return await Post.findOne(id)
        } catch(error) {
            return undefined
        }

        
    }

    @Mutation(_return => PostMutationResponse)
    async updatePost(@Arg('updatePostInput') {id,title,text} : UpdatePostInput) : Promise<PostMutationResponse> {
        try {
            const existingPost = await Post.findOne(id)
            if(!existingPost) 
            return {
                code: 400,
                success: false,
                message: 'Post not found'
            }

            existingPost.title = title
            existingPost.text = text

            await existingPost.save()

            return {
                code: 200,
                success: true,
                message: 'update successfully',
                post: existingPost
            }

        } catch {
            return {
                code: 500,
                success: false,
                message: `Internal server error`,
            }
        }
    }

    @Mutation(_return => PostMutationResponse)
    async deletePost(@Arg('id') id:number) : Promise<PostMutationResponse> {
        try {
            const existingPost = await Post.findOne(id)
            if(!existingPost)
            return {
                code: 400,
                success: false,
                message: 'Post not found'
            }

            await Post.delete({id}) //tham so id ma can delete se bang id cua id truyen vao 
            return {
                code: 200,
                success: true,
                message: 'Post deleted successfully'
            }
        } catch(error) {
            return {
                code: 500,
                success: false,
                message: `Internal server error`,
            }
        }
    }
}


import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Box, IconButton, useToast } from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { useDeletePostMutation, useMeQuery, PaginatedPosts } from '../generated/graphql';
import { Reference } from '@apollo/client';
import { useRouter } from 'next/router';

interface PostEditDeleteButtonProp {
    postId: string
    postUserId: string | undefined
}


//postId la id cua post
//postUserId la Id cua user ma so huu cai post do 
const PostEditDeleteButton = ({postId, postUserId}: PostEditDeleteButtonProp) => {

    const toast = useToast()

    const router = useRouter()

    const {data: meData} = useMeQuery()

    const [deletePost,_] = useDeletePostMutation() 

    const onPostDelete = async (postId:string) => {
        await deletePost({variables: {id: postId},
        update(cache ,{data}) {
            if(data?.deletePost.success) {
                //cache.modify la manh nhat, se de len ham merge cua apolloClient
                cache.modify({
                    fields:{
                        //reference la co san o trong apolloClient
                        posts(existing: Pick<PaginatedPosts, '__typename' | 'cursor' | 'hasMore' | 'totalCount' > & {paginatedPosts: Reference[]}) {
                            const newPostAfterDelete = {
                                ...existing,
                                totalCount: existing.totalCount - 1,
                                //dia chi trong cache ma post se muon xoa trong cache co dang la Post: ....
                                paginatedPosts: existing.paginatedPosts.filter(postRefObject => postRefObject.__ref !== `Post:${postId}`)
                            }
                            return newPostAfterDelete
                        }
                    }
                })
            }
        }

        })

        if(router.route !== '/')
        router.push('/')

        toast({
            title: 'Delete post successfully',
           
            status: 'success',
            duration: 3000,
            isClosable: true
          })

        

    }

    if(meData?.me?.id !== postUserId)
    return null

    return (
        <Box>
            <NextLink href={`post/edit/${postId}`}>
            <IconButton icon={<EditIcon />} aria-label='edit' mr={4} />
            </NextLink>
            <NextLink href="">
            <IconButton icon={<DeleteIcon />} aria-label='delete' colorScheme='red' onClick={onPostDelete.bind(this, postId)}/>
            </NextLink>
            
        </Box>
    )
}

export default PostEditDeleteButton

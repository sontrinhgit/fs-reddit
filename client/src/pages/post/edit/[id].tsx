import React from 'react'
import { useMeQuery, useOnePostQuery, useUpdatePostMutation, UpdatePostInput } from '../../../generated/graphql';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { Alert, AlertIcon, AlertTitle, Box, Button, Flex, FormControl, Link, Spinner } from '@chakra-ui/react';
import NextLink from 'next/link'
import { Form, Formik } from 'formik';
import InputField from '../../../components/InputField';
const PostEdit = () => {

    const router = useRouter()
    const postId = router.query.id as string

  const [updatePost, _] = useUpdatePostMutation()

    //check login
    const {data: meData, loading: meLoading} = useMeQuery()

    //truyen vao id url cua post 
    const {data:postData, loading:postLoading} = useOnePostQuery({variables: {id: postId }})

    //trong cai UpdatePostInput se co 3 field, dung omit de loai bo di field id va nhan vao 2 field con lai va truyen vao values 
    const onUpdatePostSubmit = async(values: Omit<UpdatePostInput, 'id'>) => {
        await updatePost({
            variables: {updatePostInput : {
                id: postId,
                //values nay chinh la title va text
                ...values
            }}
        })
        router.back()
    }

    if(meLoading || postLoading) 
    return (
        <Layout>
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      </Layout>
    )

    //k tim duoc post do 
    if(!postData?.post)
    return  <Layout>
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>Post not found</AlertTitle>
    </Alert>
    <NextLink href="/">
      <Button>Go back home page</Button>
    </NextLink>
  </Layout>

      //check data.id cua mot user trung voi post.user.id cua user do 
    if(!meLoading && !postLoading && meData?.me?.id !== postData?.post?.userId?.toString()) 
    return (
        <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unauthorized</AlertTitle>
        </Alert>
        <NextLink href="/">
          <Button>Go back home page</Button>
        </NextLink>
      </Layout>
    )

    const initialValue = {title: postData?.post?.title, text: postData?.post?.text}

    return (
        <Layout>
        <Formik initialValues={initialValue} onSubmit={onUpdatePostSubmit}>
        {/* Formik tra ve mot function, trong function do co chua values la children  */}
        {/* handleChange la ham helper co san o trong Formik  */}
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="title"
                placeholder="Title"
                label="Title"
                type="text"
              />
              <Box mt={4}>
                <InputField
                textarea
                  name="text"
                  placeholder="Text"
                  label="Text"
                  type="textarea"
                />
              </Box>

          <Flex justifyContent='space-between' align='center'  mt={4}> 
          <Button
                type="submit"
                colorScheme="teal"
               
                isLoading={isSubmitting}
              >
                Update post
              </Button>
              <NextLink href="/">
                  <Button>Go back to home page</Button>
              </NextLink>
          </Flex>
              
            </FormControl>
          </Form>
        )}
      </Formik>
      </Layout>
    )
}

export default PostEdit

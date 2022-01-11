import { Box, Button, Flex, FormControl, Spinner, useToast } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCheckAuth } from "../utils/useCheckAuth";
import {
  useCreatePostMutation,
  CreatePostInput,
} from "../generated/graphql";
import router from "next/router";

const CreatePost = () => {

  const toast = useToast()
  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValue = { title: "", text: "" };

  const [createPost, _] = useCreatePostMutation();

  const onCreatePostSubmit = async (values: CreatePostInput) => {
    //khi mot post moi den thi post do se nhay vao vi tri cuoi cung o trong cache o Apollo nen ta can phai cap nhat lai cache
    //post moi se tu dong dua xuong cai cache
    await createPost({
      variables: { createPostInput: values }
    });
    toast({
      title: 'Create post successfully',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    router.push("/");
  };

  //co loading hoac het loading roi nhung ma chua login
  // se dung useCheckAuth de day ve /login
  if (authLoading || (!authLoading && !authData?.me)) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  } else {
    return (
      <Layout>
        <Formik initialValues={initialValue} onSubmit={onCreatePostSubmit}>
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
                    placeholder="text"
                    label="Text"
                    type="textarea"
                  />
                </Box>

                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  create Post
                </Button>
              </FormControl>
            </Form>
          )}
        </Formik>
      </Layout>
    );
  }
};

export default CreatePost;

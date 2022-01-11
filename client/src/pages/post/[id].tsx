import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";
import {
  OnePostDocument,
  OnePostQuery,
  PostIdsDocument,
  PostIdsQuery,
  useOnePostQuery,
} from "../../generated/graphql";
import { addApolloState, initializeApollo } from "../../lib/apolloClient";
import { limit } from "../index";
import NextLink from "next/link";
import { GetStaticProps } from 'next';


const Post = () => {
  const router = useRouter();
  const { data, loading, error } = useOnePostQuery({
    variables: { id: router.query.id as string },
  });

  //loading se return cai nay
  if (loading)
    return (
      <Layout>
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      </Layout>
    );


    //loading xong roi se di den cai nay, check data va error
  if (error || !data?.post)
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>{error ? error.message : "Post not found"}</AlertTitle>
        </Alert>
        <Flex mt={4} justifyContent='space-between' alignItems='center' >
        
        <NextLink href="/">
          <Button>Go back home page</Button>
        </NextLink>
        
        </Flex>
        
      </Layout>
    );


    //moi thu thanh cong 
  return (
    <Layout>
      
        <Heading mb={4}>{data.post.title}</Heading>
        <Box mb={4}>{data.post.text}</Box>
        <Flex mt={4} justifyContent='space-between' alignItems='center' >
       
          <NextLink href="/">
            <Button>Go back home page</Button>
          </NextLink>
        </Flex>
      
    </Layout>
  );
};

//nhung trang nao co duong link dong thi phai dung den getStaticPath

//usePostIdsQuery va useOnePostQuery chi duoc su dung trong main component thoi, k duoc su dung o next. O next muon render ra phai goi apolloClient
export const getStaticPaths = async () => {
  //do de limit la 3 post nen bay gio cung chi SSR render ra 3 post san ma thoi

  const apolloClient = initializeApollo();

  //phai goi data ve nen phai xuat ra data

  const { data } = await apolloClient.query<PostIdsQuery>({
    query: PostIdsDocument,
    variables: { limit },
  });

  return {
    paths: data.posts!.paginatedPosts.map((post) => ({
      params: { id: `${post.id}` },
    })),
    fallback: "blocking",
  };
};

//params nay chinh la lay tu getStaticPaths
export const getStaticProps: GetStaticProps<
  { [key: string]: any },
  { id: string }
> = async ({ params }) => {
  const apolloClient = initializeApollo();

  await apolloClient.query<OnePostQuery>({
    query: OnePostDocument,
    variables: { id: params?.id },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Post;

import { NetworkStatus } from "@apollo/client";
import { Box, Button, Flex, Heading, Link, Spinner, Stack, Text } from "@chakra-ui/react";
import NextLink from 'next/link';
import Layout from "../components/Layout";
import PostEditDeleteButton from "../components/PostEditDeleteButton";
import { PostsDocument, usePostsQuery } from '../generated/graphql';
import { addApolloState, initializeApollo } from "../lib/apolloClient";

export const limit = 3

const Index = () => {
  //vi gia tri limit truyen vao la gia tri bat buoc
  const { data, loading, fetchMore, networkStatus } = usePostsQuery({variables: {limit}, 
    //component nao render boi Posts query nay thi se rerender khi networkStatusChange thay doi, tuc la fetch more
    //fetchMore chi la ham goi lai chinh query nay
    //ap dung vao loadMore, khi do fetchMore se goi lai query mot lan nua
    notifyOnNetworkStatusChange: true});

    const loadingMorePost = networkStatus === NetworkStatus.fetchMore

    const loadMorePost = () => fetchMore({variables: {cursor: data?.posts?.cursor}})



  return (
    <Layout>
      
      {loading && !loadingMorePost ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Stack spacing={8}>
          {data?.posts?.paginatedPosts.map(post => (
            <Flex key={post.id} p={5} shadow='md' borderWidth='10px'>
              <Box flex={1}>
                <NextLink href={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize='xl'>
                      {post.title}
                    </Heading>
                  </Link>
                </NextLink>
                <Text>Posted by {post.user.username}</Text>
                <Flex align='center'>
                  <Text mt={4}>{post.textSnippet}</Text>
                  <Box  ml='auto'>
                    {/* khi ma log in thi moi thay duoc 2 nut edit va delete */}
                    <PostEditDeleteButton postId={post.id} postUserId = {post.user.id} /> 
           
                  </Box>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}

      {data?.posts?.hasMore && (
        <Flex>
          <Button m='auto' my={8} isLoading={loadingMorePost} onClick={loadMorePost}> {loadingMorePost ? 'Loading' : 'Show more'}</Button>
        </Flex>
      )}
    </Layout>
  );
};

//apolloClient da xay toan bo code de lay data ve va luu vao trong cache, day chinh la noi lay du lieu ve va dua vao trong cache

//SSG phai de o trang chu de lay data ve
//lay du lieu tu graphQL va xay frontend dua theo next.js
export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit //limit default la 3
    }
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;

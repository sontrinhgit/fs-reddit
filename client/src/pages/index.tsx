import Navbar from "../components/Navbar";
import Register from "./register";
import { PostsDocument, usePostsQuery } from '../generated/graphql';
import { addApolloState, initializeApollo } from "../lib/apolloClient";

const Index = () => {
  const {data, loading} = usePostsQuery()

  return (
    <>
    <Navbar />
    {loading ? ('Loading...') : (
      <ul>
        {data?.posts?.map((post, index) => (
          <li key={index}>{post.title}</li>
        ))}
      </ul>
    )}
    </>
  )
}

 //apolloClient da xay toan bo code de lay data ve va luu vao trong cache 

//SSG phai de o trang chu de lay data ve
//lay du lieu tu graphQL va xay frontend dua theo next.js
export const getStaticProps = async () => {
  const apolloClient = initializeApollo()

  await apolloClient.query({
    query: PostsDocument,
//k can variables vi k co tham so nao truyen vao cho query nay 
  })

  return addApolloState(apolloClient, {
    props: {},
  })
}

export default Index;

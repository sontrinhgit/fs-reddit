import { Box, Button, Flex, FormControl, Link, Spinner, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";
import NextLink from 'next/link'


const Login = () => {
  const router = useRouter();

  const toast = useToast()

  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValue: LoginInput = { usernameOrEmail: "", password: "" };

  const [loginUser, { data, loading: _loginUserLoading, error }] =
    useLoginMutation();

  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      //gia tri nhan ve cua mot cache la trong mot data, day la minh destructure data trong data do ra
      update(cache, { data }) {
        console.log("DATA LOGIN", data);

        /*  const meData = cache.readQuery({query: MeDocument })
        console.log('MEDATA', meData) */

        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            //neu hai model k giong nhau thi phai ve tung data ma muon push vao object do
            data: { me: data.login.user },
          });
        }
      },
    });

    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else if (response.data?.login?.user) {
      //login successfully
      //dat toast len day thi toast se duoc load len truoc khi router push sang / 
      toast({
        title: 'Welcome',
        description: `${response.data.login.user.username}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      router.push("/");
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <Flex justifyContent='center' alignItems='center' minH='100vh'>
              <Spinner />
        </Flex>
      
      ) : (
        <Wrapper size='small'>
          {error && <p>Fail to login. Internal server error</p>}
          
          <Formik initialValues={initialValue} onSubmit={onLoginSubmit}>
            {/* Formik tra ve mot function, trong function do co chua values la children  */}
            {/* handleChange la ham helper co san o trong Formik  */}
            {({ isSubmitting }) => (
              <Form>
                <FormControl>
                  <InputField
                    name="usernameOrEmail"
                    placeholder="Username Or Email"
                    label="Username or Email"
                    type="text"
                  />
                  <Box mt={4}>
                    <InputField
                      name="password"
                      placeholder="password"
                      label="Password"
                      type="password"
                    />
                  </Box>

                <Flex mt={2}>
                  <NextLink href='/forgot-password'>
                    <Link ml='auto'> Forgot password</Link>
                  </NextLink>
                </Flex>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    mt={4}
                    isLoading={isSubmitting}
                  >
                    Login
                  </Button>
                </FormControl>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  );
};

export default Login;

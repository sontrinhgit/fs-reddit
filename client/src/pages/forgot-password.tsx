import { Box, Button, Flex, Link, Spinner } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";
import NextLink from "next/link";

const ForgotPassword = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValues = { email: "" };

  const [forgotPassword, { loading, data }] = useForgotPasswordMutation();

  const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({ variables: { forgotPasswordInput: values } });
  };

  //dang loading hoac chua loading, nhung ma login roi thi se hien ra cai spinner
  //check xem neu user da login roi thi se k duoc access
  if (authLoading || (!authLoading && authData?.me)) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  } else
    return (
      <Wrapper>
        <Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
          {/* Formik tra ve mot function, trong function do co chua values la children  */}
          {/* handleChange la ham helper co san o trong Formik  */}
          {({ isSubmitting }) =>
            !loading && data ? (
              <Box>Please check your inbox</Box>
            ) : (
              <Form>
                <InputField
                  name="email"
                  placeholder="Email"
                  label="Email"
                  type="email"
                />

                <Flex mt={2}>
                  <NextLink href="/login">
                    <Link ml="auto"> Back to Login</Link>
                  </NextLink>
                </Flex>

                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Send Reset Password email
                </Button>
              </Form>
            )
          }
        </Formik>
      </Wrapper>
    );
};

export default ForgotPassword;

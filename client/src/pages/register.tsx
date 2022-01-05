import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { Formik, Form, FormikHelpers } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {
  MeDocument,
  RegisterInput,
  useRegisterMutation,
  UserMutationResponse,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useRouter } from "next/router";
import { MeQuery } from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const Register = () => {
  const router = useRouter();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValue: RegisterInput = { username: "", email: "", password: "" };

  const [registerUser, { data, loading: _registerUserLoading, error }] =
    useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register?.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.register.user },
          });
        }
      },
    });

    if (response.data?.register?.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register?.user) {
      //register successfully
      router.push("/");
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Wrapper>
          {error && <p>Fail to register</p>}
          {data && <p>Register successfully {JSON.stringify(data)}</p>}
          <Formik initialValues={initialValue} onSubmit={onRegisterSubmit}>
            {/* Formik tra ve mot function, trong function do co chua values la children  */}
            {/* handleChange la ham helper co san o trong Formik  */}
            {({ isSubmitting }) => (
              <Form>
                <FormControl>
                  <InputField
                    name="username"
                    placeholder="username"
                    label="Username"
                    type="text"
                  />
                  <Box mt={4}>
                    <InputField
                      name="email"
                      placeholder="email"
                      label="Email"
                      type="text"
                    />
                  </Box>
                  <Box mt={4}>
                    <InputField
                      name="password"
                      placeholder="password"
                      label="Password"
                      type="password"
                    />
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    mt={4}
                    isLoading={isSubmitting}
                  >
                    Register
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

export default Register;

import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constant";
@Resolver()
export class UserResolver {
  //String nay la String cua graphQL
  @Mutation((_returns) => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() {req,res}:Context
  ): Promise<UserMutationResponse> 
  
  {
    const validateRegisterInputErrors = validateRegisterInput(registerInput);

    if (validateRegisterInputErrors !== null)
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      };
    try {
      const { username, email, password } = registerInput;
      const existingUser = await User.findOne({
        //check both username and email
        where: [{ username }, { email }],
      });
      if (existingUser)
        return {
          code: 400,
          success: false,
          message: "Duplicate username or email",
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: `${
                existingUser.username === username ? "Username" : "email"
              } already taken`,
            },
          ],
        };

      const hashedPassword = await argon2.hash(password);

      let newUser = User.create({
        username,
        password: hashedPassword,
        email
      });

      
      await User.save(newUser)
      //phai dat newUser len truoc de newUser co id thi moi lay duoc id do
      req.session.userId = newUser.id
      
      return {
        code: 200,
        success: true,
        message: "User registration successfully",
        user: newUser
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    //ctx chinh la context, lay req va res tu context o apolloserver 
    @Ctx() {req}: Context

  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );

      if (!existingUser)
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameoremail",
              message: "Username or email incorrect",
            },
          ],
        };

      const passwordValid = await argon2.verify(
        existingUser.password,
        password
      ); //value 1 is the value in database, value 2 is the input value
      if (!passwordValid)
        return {
          code: 400,
          success: false,
          message: "Wrong password",
          errors: [{ field: "password", message: "Incorrect password" }],
        };

        //create Session and then return cookie anytime have one user login successfully 

        //userId of session that was created in Context file 
        req.session.userId = existingUser.id


      return {
        code: 200,
        success: true,
        message: "Login successfully",
        user: existingUser
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error`,
      };
    }
  }

  @Mutation(_returns => Boolean)
  async logout (@Ctx() {req,res}:Context) : Promise<boolean> {
      //de gach chan o duoi reject do minh k can toi no 
      //phai dat no vao mo promise vi trong ham destroy yeu cau mot callback 
      return new Promise((resolve, _reject)  => {
        res.clearCookie(COOKIE_NAME)
        req.session.destroy(error => {
            console.log(' DESTROY SESSION ERROR', error)
            resolve(false)
        })
        resolve(true)
      } )
   
  }
}

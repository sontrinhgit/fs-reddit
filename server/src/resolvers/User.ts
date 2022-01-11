import argon2 from "argon2";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { COOKIE_NAME } from "../constant";
import { User } from "../entities/User";
import { TokenModel } from "../models/token";
import { Context } from "../types/Context";
import { ForgotPasswordInput } from '../types/ForgotPassword';
import { LoginInput } from "../types/LoginInput";
import { RegisterInput } from "../types/RegisterInput";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { sendEmail } from "../utils/sendEmail";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import {v4 as uuidv4} from 'uuid'
import { ChangePasswordInput } from "../types/ChangePasswordInput";
import session from 'express-session';
import { Session } from 'express-session';

@Resolver(_of => User)
export class UserResolver {

  @FieldResolver(_return => String)
  email(@Root() user: User, @Ctx() {req}: Context) {
    return req.session.userId === user.id ? user.email : ''
  }

  //check the user have login or not
  @Query((_return) => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
    if (!req.session.userId) return null;

    const user = await User.findOne(req.session.userId);
    return user;
  }

  //String nay la String cua graphQL
  @Mutation((_return) => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req, res }: Context
  ): Promise<UserMutationResponse> {
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
        email,
      });

      await User.save(newUser);
      //phai dat newUser len truoc de newUser co id thi moi lay duoc id do
      req.session.userId = newUser.id;

      return {
        code: 200,
        success: true,
        message: "User registration successfully",
        user: newUser,
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
    @Ctx() { req }: Context
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
      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        message: "Login successfully",
        user: existingUser,
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

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    //de gach chan o duoi reject do minh k can toi no
    //phai dat no vao mo promise vi trong ham destroy yeu cau mot callback
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log(" DESTROY SESSION ERROR", error);
          resolve(false);
        }
        resolve(true);
        console.log("Finish logout");
      });
    });
  }


  @Mutation(_return => Boolean)
  async forgotPassword(@Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput): Promise<boolean> {
    const user = await User.findOne({email: forgotPasswordInput.email})
    
    if(!user) 
    return true 

    await TokenModel.findOneAndDelete({userId: `${user.id}`})

   const resetToken = uuidv4()
   //k duoc phep de lo ra token tran trui
   //hash token giong nhu password

   const hasedToken = await argon2.hash(resetToken)

    await new TokenModel({userId: `${user.id}`, token: hasedToken}).save()
    

    //tra ve cho ng dung thi duoc phep tra token goc 
    await sendEmail(forgotPasswordInput.email as string , `<a href='http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}'>Click to here to change password</a>`)

    return true
  }

  @Mutation(_return => UserMutationResponse)
  async changePassword(
    @Arg('token') token: string, 
    @Arg('userId') userId: string,
    @Arg('changePasswordInput',) changePasswordInput: ChangePasswordInput,
    @Ctx() {req}: Context
  ): Promise<UserMutationResponse> {
    if(changePasswordInput.newPassword?.length <= 2) {
      return {
        code: 400,
        success: false,
        message: 'Invalid password',
        errors: [
          {
            field: 'newPassword',
            message: 'Length must be greater than 2'
          }
        ]
      }
    }

    try {
      //tim token ma trung voi cai userId do 
      const resetPasswordTokenRecord = await TokenModel.findOne({userId})
      if(!resetPasswordTokenRecord) {
        return {
          code: 400,
          success: false,
          message: 'Invalid or expired password reset token',
          errors: [
            {
              field: 'token',
              message: 'Invalid or expired token'
            }
          ]
        }
      }

      //token nay chinh la token lay vao tu phia input ma ta truyen vao arg o tren 
      const resetPasswordTokenValid = argon2.verify(resetPasswordTokenRecord.token, token)

      if(!resetPasswordTokenValid)
      return {
        code: 400,
        success: false,
        message: 'Invalid or expired password reset token',
        errors: [
          {
            field: 'token',
            message: 'Invalid or expired token'
          }
        ]
      }

      //parseInt tai vi gia tri luu trong mongoDB la string nen can phai parseInt
      const userIdNum = parseInt(userId)
      const user = await User.findOne(userIdNum) //se tim hai cai id giong nhau o mongoDB va postgre

      if(!user) 
      return {
        code: 400,
        success: false,
        message: 'User no longer available',
        errors: [
          {
            field: 'user error',
            message: 'User no longer exist'
          }
        ]
      }

      const updatedPassword = await argon2.hash(changePasswordInput.newPassword)

      await User.update({id: userIdNum}, {password: updatedPassword})

      await resetPasswordTokenRecord.deleteOne()

      req.session.userId = user.id

      return {
        code: 200,
        success: true,
        message: 'User password reset successfully',
       user: user
      }

    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error`,
        
      }
    }
  }



}

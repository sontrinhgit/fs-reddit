import { AuthenticationError } from "apollo-server-core";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";


//use middleware to check the user log in or not 
//MiddleWareFunction nhan vao Context Type  
export const checkAuth: MiddlewareFn<Context> = async ({ context : {req} }, next) => {
   if(!req.session.userId)
   throw new AuthenticationError('Not authenticated to perform GraphQl operation')

   return next()
  };
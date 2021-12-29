import { Field, InputType } from "type-graphql";

//day la input nen se de la InputType 
@InputType()

export class LoginInput {
      @Field()
      usernameOrEmail!: string 

      @Field()
      password!: string
} 
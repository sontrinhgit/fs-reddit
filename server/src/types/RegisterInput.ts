import { Field, InputType } from "type-graphql";

//day la input nen se de la InputType 
@InputType()

export class RegisterInput {
      @Field()
      username!: string 

      @Field()
      email!: string 

      @Field()
      password!: string
} 
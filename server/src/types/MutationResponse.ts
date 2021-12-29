import { Field, InterfaceType } from "type-graphql";

@InterfaceType()
export abstract class IMutationResponse {

    @Field(_type => Number)
    code: number | undefined

    @Field(_type => Boolean)
    success: boolean | undefined 

    @Field({nullable: true})
    //vi khong bat buoc nen phai khai bao la nullable 
    message?: string 
}
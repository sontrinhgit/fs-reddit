import { Field, ObjectType } from 'type-graphql';
@ObjectType()
export class FieldError {
    @Field(_type => String)
    field: string | undefined

    @Field(_type => String )
    message: string | undefined

}
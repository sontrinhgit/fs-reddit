import { ObjectType, Field } from 'type-graphql';
import { IMutationResponse } from './MutationResponse';
import { User } from '../entities/User';
import { FieldError } from './FieldError';
@ObjectType({ implements: IMutationResponse})

export class UserMutationResponse implements IMutationResponse {
    code: number | undefined
    success: boolean | undefined
    message?: string

    @Field({nullable: true}) 
    user?: User
    
    @Field(_type =>[FieldError], {nullable: true }) //day la ngon ngu cua graphql 
    errors?: FieldError[]
}
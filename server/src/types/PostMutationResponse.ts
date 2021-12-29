import { ObjectType, Field } from 'type-graphql';
import { IMutationResponse } from './MutationResponse';

import { FieldError } from './FieldError';
import { Post } from '../entities/Post';
@ObjectType({ implements: IMutationResponse})

export class PostMutationResponse implements IMutationResponse {
    code: number | undefined
    success: boolean | undefined
    message?: string

    @Field({nullable: true}) 
    post?: Post
    
    @Field(_type =>[FieldError], {nullable: true }) //day la ngon ngu cua graphql 
    errors?: FieldError[]
}
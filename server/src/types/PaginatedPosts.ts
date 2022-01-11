import { Field, ObjectType } from "type-graphql";
import { Post } from "../entities/Post";

//vi tra ve gia tri nen phai khai bao la ObjectType 
@ObjectType() 
export class PaginatedPosts {
    @Field()
    totalCount!: number

    //xac dinh xem con tro nam o dau, day la nam o bai post cuoi cung khi load xong 
    @Field(_type =>  Date)
    cursor!: Date
 
    @Field()
    hasMore!: boolean

    @Field(_type => [Post]) //kieu nay la cua graphQl
    paginatedPosts!: Post[] //kieu nay la cua typescript
}
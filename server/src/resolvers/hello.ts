import { Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../types/Context";


@Resolver()
export class HelloResolver {
  //String nay la String cua graphQL
  @Query((_returns) => String)
  hello(@Ctx() {req}: Context) {
    console.log(req.session.userId);
    return '123'
  }
}

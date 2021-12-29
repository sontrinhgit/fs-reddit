import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
    //String nay la String cua graphQL
    @Query(_returns => String)
    hello() {
        return 'Hello world'
    }
}
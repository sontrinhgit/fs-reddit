
import { Context } from '../types/Context'
import { Ctx, Query, Resolver } from 'type-graphql'

@Resolver()
export class HelloResolver {
	@Query(_returns => String)
	hello(@Ctx() { req }: Context) {
		const id = req.session.userId
		console.log(id)
		return 'hello world'
	}
}
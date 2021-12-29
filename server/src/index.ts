require('dotenv').config()
import { ApolloServer } from 'apollo-server-express';
import MongoStore from 'connect-mongo';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constant';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/Post';
import { UserResolver } from './resolvers/User';
import { Context } from './types/Context';

const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'reddit',
        username: process.env.DB_USERNAME_DEV,
        password: process.env.DB_PASSWORD_DEV,
        logging: true,
        synchronize: true, //tu dong lay model roi uplen database thi se kp chay migration 
        entities: [User, Post]

    })

    const app = express()

    //Session and Cookie Store 

    const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@reddit.b6kl0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

    await mongoose.connect(mongoUrl, {
        
    })

    console.log('MongoDB connect')

    app.use(session({
        name: COOKIE_NAME,
        store: MongoStore.create({mongoUrl}),
        cookie: {
            maxAge: 1000 * 60 * 60, //one hour
            httpOnly: true, //JS frondend can not access the cookie
            secure: __prod__ ,    //cookie only works in HTTPS
            sameSite: 'lax' ,//protection against CSRF

        },
        secret: process.env.SESSION_SECRET_DEV_PROD as string,
        saveUninitialized: false, //dont save empty session, right from the start //khi nao login thi moi save session 
        resave: false
    }))


    const apolloServer = new ApolloServer({
        //trong build Schema thi se dien vao chung cai resolver ma ta da dang ki 
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver, PostResolver],
            validate: false 
        }),
        context: ({ req, res }): Context => ({req,res})
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({app, cors: true})

    const PORT = process.env.PORT || 4000
    app.listen(4000, () => console.log(`Server run on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}` ))
}

main().catch(error => console.log(error))
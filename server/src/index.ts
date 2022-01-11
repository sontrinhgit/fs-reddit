require('dotenv').config()
import { ApolloServer } from 'apollo-server-express';
import MongoStore from 'connect-mongo';
import express from 'express';
import session from 'express-session';
import mongoose, { connection } from 'mongoose';
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
import cors from 'cors'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { sendEmail } from './utils/sendEmail';
import path from 'path';

const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        ...(__prod__ ? {url: process.env.DATABASE_URL}: { database: 'reddit',
        username: process.env.DB_USERNAME_DEV,
        password: process.env.DB_PASSWORD_DEV,} ),
       
        logging: true,
        //connection de ket noi voi DB khi Deploy
        ...(__prod__ ? {
            extra: {
                ssl: {
                    rejectUnauthorized: false
                }
            }, ssl: true
        } : {}),
        //khi ma viet code thi de la true
        //khi deploy len phai tao mot DB moi de viet SQL len do 
        //trong moi truong dev se chay synchronize: true
        ...(__prod__ ? {} :{ synchronize: true}), //tu dong lay model roi uplen database thi se kp chay migration 
        entities: [User, Post],
        migrations: [path.join(__dirname, '/migrations/*')]

    })

    //trong moi truong product se chay la connection.runMigrations => chui vao migration folder va chay SQL trong folder do 
    if (__prod__) await connection.runMigrations()
   

    const app = express()

    app.use(cors({
        origin: __prod__ ? process.env.CORS_ORIGIN_PROD :  process.env.CORS_ORIGIN_DEV,
        credentials: true
    }))

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
            sameSite: 'lax' ,//protection against CSRF,
            domain: __prod__ ? '.vercel.app' : undefined

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
        context: ({ req, res }): Context => ({req,res}),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
        
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({app, cors: false})

    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`Server run on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}` ))
}

main().catch(error => console.log(error))
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const apollo_server_express_1 = require("apollo-server-express");
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const mongoose_1 = __importDefault(require("mongoose"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constant_1 = require("./constant");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const hello_1 = require("./resolvers/hello");
const Post_2 = require("./resolvers/Post");
const User_2 = require("./resolvers/User");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, typeorm_1.createConnection)({
        type: 'postgres',
        database: 'reddit',
        username: process.env.DB_USERNAME_DEV,
        password: process.env.DB_PASSWORD_DEV,
        logging: true,
        synchronize: true,
        entities: [User_1.User, Post_1.Post]
    });
    const app = (0, express_1.default)();
    //Session and Cookie Store 
    const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@reddit.b6kl0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    yield mongoose_1.default.connect(mongoUrl, {});
    console.log('MongoDB connect');
    app.use((0, express_session_1.default)({
        name: constant_1.COOKIE_NAME,
        store: connect_mongo_1.default.create({ mongoUrl }),
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            secure: constant_1.__prod__,
            sameSite: 'none', //protection against CSRF
        },
        secret: process.env.SESSION_SECRET_DEV_PROD,
        saveUninitialized: false,
        resave: false
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        //trong build Schema thi se dien vao chung cai resolver ma ta da dang ki 
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, User_2.UserResolver, Post_2.PostResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res })
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server run on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`));
});
main().catch(error => console.log(error));

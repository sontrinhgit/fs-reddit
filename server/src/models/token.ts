import mongoose from 'mongoose';
import {prop, getModelForClass} from '@typegoose/typegoose'


export class Token {
    _id!: mongoose.Types.ObjectId

    @prop({required: true})
    userId!: string 

    @prop({required: true})
    token!: string 

    @prop({default: Date.now, expires: 60 * 5}) //token exist only in 5 minutes
    createAt!: Date
}

// khong giong nhu session chi co mot gia tri, voi token luu vao thi phai tao ra mot model rieng


export const TokenModel = getModelForClass(Token)
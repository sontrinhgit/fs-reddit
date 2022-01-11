import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";


//if want to talk with graphQl so need objectType()
@ObjectType()

@Entity()
export class Post extends BaseEntity {
    //co Field nghia la the hien cho viec se dua ra frontend
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(_type => String)
    @Column()
    title!: string

    //them nullable: true o column de co insert vao DB mot cot moi la userID hoac ta co the doi cai syncronize ket noi voi database o index la thank false
    @Field({nullable: true})
    @Column({nullable: true})
    userId?: number

    @Field(_type => User)
    //k tao ra column, postgresql se mo ra mot foreignKey de noi tu post nay sang user 
    @ManyToOne(()=> User, user => user.posts)
    user: User

    @Field(_type => String)
    @Column()
    text!: string

    @Field(_type => Date)
    @CreateDateColumn( {type:'timestamptz'}) //de so sanh xem post nao post truoc post sau 
    createdAt: Date | undefined

    @Field(_type => Date)
    @CreateDateColumn({type:'timestamptz'}) //timestampt with timezone, Dedault Date is time without timezone
    updatedAt: Date | undefined



}
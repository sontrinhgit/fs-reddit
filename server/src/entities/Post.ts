import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


//if want to talk with graphQl so need objectType()
@ObjectType()

@Entity()
export class Post extends BaseEntity {
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(_type => String)
    @Column()
    title!: string

    @Field(_type => String)
    @Column()
    text!: string

    @Field(_type => Date)
    @CreateDateColumn()
    createdAt: Date | undefined

    @Field(_type => Date)
    @CreateDateColumn()
    updatedAt: Date | undefined



}
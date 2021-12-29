import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
//object type la de noi chuyen voi graphql 
//Decorator => DB table
//Decorator entity la de noi chuyen voi postgresql 
@Entity()
export class User extends BaseEntity {
    //cai gi muon tra ve cho graphQL thi phai danh dau noi voi field 
    @Field(_type => ID)
  @PrimaryGeneratedColumn()
  //! co nghia la cot nay k duoc phep null
  id!: number;


  //column goi la decorator, unique la nhung cai option se past vao decorator do
    @Field(_type => String)
  @Column({ unique: true })
  username!: string;

  //password k tra ve vi can phai private 
  @Column()
  password!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field(_type => Date)
    @CreateDateColumn()
    createdAt: Date | undefined;

  @Field(_type => Date)
  @CreateDateColumn()
  updatedAt: Date | undefined ;
}

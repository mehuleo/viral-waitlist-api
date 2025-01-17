/* eslint-disable max-classes-per-file */
import {
  Field,
  ID,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import md5 from 'crypto-js/md5';

@ObjectType()
export class UserMeta {
  @Field({ nullable: true })
  referralCount!: number;

  @Field({ nullable: true })
  bonusCount?: number;
}

@ObjectType()
@Entity()
export default class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Field()
  @Column()
  email!: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  hasConfirmedEmail!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referrerId!: string;

  @Field({ defaultValue: 0 })
  @Column({ default: 0 })
  points!: number;

  @Field({ defaultValue: 0 })
  @Column({ default: 0 })
  originalPosition!: number;

  @Field({ defaultValue: 0 })
  @Column({ default: 0 })
  position!: number;

  get hash(): string {
    const st = `${this.id}${this.email}${this.createdAt}fakeSalt`;
    return md5(st).toString();
  }

  @Field(() => UserMeta,  { nullable: true })
  @Column({ type: 'json', nullable: true })
  meta!: UserMeta;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

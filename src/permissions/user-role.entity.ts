import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User, UserRole } from '../users/users.entity';

@ObjectType()
@Entity('user_role')
export class UserRoleMapping {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user' })
  user: User;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}

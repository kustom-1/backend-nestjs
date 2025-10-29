import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User, UserRole } from '../users/users.entity';

@Entity('user_role')
export class UserRoleMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Cloth } from '../cloths/cloth.entity';

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() => Cloth, { nullable: true })
  @JoinColumn({ name: 'cloth' })
  cloth: Cloth;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

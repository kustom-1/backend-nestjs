import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user' })
  user: User;

  // Use simple-array to store tags as comma-separated values
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;
}

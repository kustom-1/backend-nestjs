import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Address } from '../addresses/address.entity';

@Entity({ name: 'order' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { default: 1 })
  quantity: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column('timestamp', { nullable: true })
  date: Date;

  @Column({ nullable: true })
  status: string;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'address' })
  address: Address;
}

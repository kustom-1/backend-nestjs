import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order' })
  order: Order;

  @Column('float', { default: 0 })
  amount: number;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  status: string;

  @Column('timestamp', { name: 'transaction_date', nullable: true })
  transactionDate: Date;
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn } from 'typeorm';
import { Design } from '../designs/design.entity';
import { Order } from '../orders/order.entity';

@Entity('design_history')
export class DesignHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Design, { nullable: false })
  @JoinColumn({ name: 'design_id' })
  design: Design;

  @Column('int', { default: 1 })
  version: number;

  @Column('json', { nullable: true, name: 'data_snapshot' })
  dataSnapshot: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order' })
  order: Order;
}

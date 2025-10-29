import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('cloths')
export class Cloth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float', { name: 'base_price', default: 0 })
  basePrice: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category' })
  category: Category;

  @Column({ name: 'model_url', nullable: true })
  modelUrl: string;

  @Column()
  name: string;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cloth } from '../cloths/cloth.entity';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  size: string;

  @Column('int', { default: 0 })
  stock: number;

  @ManyToOne(() => Cloth, { nullable: false })
  @JoinColumn({ name: 'cloth' })
  cloth: Cloth;
}

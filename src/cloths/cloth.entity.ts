import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Category } from '../categories/category.entity';

@ObjectType()
@Entity('cloths')
export class Cloth {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Float)
  @Column('float', { name: 'base_price', default: 0 })
  basePrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Category)
  @ManyToOne(() => Category, { nullable: false, eager: true })
  @JoinColumn({ name: 'category' })
  category: Category;

  @Field({ nullable: true })
  @Column({ name: 'model_url', nullable: true })
  modelUrl: string;

  @Field()
  @Column()
  name: string;
}

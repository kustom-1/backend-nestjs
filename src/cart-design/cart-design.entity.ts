import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Design } from '../designs/design.entity';
import { Cart } from '../carts/cart.entity';

@Entity('cart_design')
export class CartDesign {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Design, { nullable: false })
  @JoinColumn({ name: 'design' })
  design: Design;

  @ManyToOne(() => Cart, { nullable: false })
  @JoinColumn({ name: 'cart' })
  cart: Cart;

  @Column('int', { default: 1 })
  quantity: number;

  @Column('float', { default: 0 })
  subtotal: number;
}

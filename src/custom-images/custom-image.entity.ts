import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Image } from '../images/image.entity';
import { Design } from '../designs/design.entity';

@Entity('custom_images')
export class CustomImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Image, { nullable: false })
  @JoinColumn({ name: 'image' })
  image: Image;

  @Column('json', { nullable: true })
  config: Record<string, any>;

  @ManyToOne(() => Design, { nullable: true })
  @JoinColumn({ name: 'design' })
  design: Design;
}

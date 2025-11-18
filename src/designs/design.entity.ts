import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Cloth } from '../cloths/cloth.entity';
import { Image } from '../images/image.entity';

export interface DecalTransform {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  aspectRatio: number;
}

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

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'base_model' })
  baseModel: Image;

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'decal_image' })
  decalImage: Image;

  @Column({ name: 'base_color', nullable: true })
  baseColor: string;

  @Column({ type: 'jsonb', nullable: true })
  decal: DecalTransform;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

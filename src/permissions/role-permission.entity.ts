import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserRole } from '../users/users.entity';

@ObjectType()
@Entity('role_permissions')
export class RolePermission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Field()
  @Column()
  resource: string; // 'users', 'documents', 'files', etc.

  @Field()
  @Column()
  action: string; // 'create', 'read', 'update', 'delete', 'subir', 'consultar', etc.

  @Field(() => String, { nullable: true })
  @Column('json', { nullable: true })
  conditions: Record<string, any>; // Condiciones adicionales opcionales

  @Field()
  @Column({ default: 'allow' })
  effect: 'allow' | 'deny';

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string; // Descripción del permiso para admin
} 
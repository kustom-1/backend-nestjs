import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../users/users.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column()
  resource: string; // 'users', 'documents', 'files', etc.

  @Column()
  action: string; // 'create', 'read', 'update', 'delete', 'subir', 'consultar', etc.

  @Column('json', { nullable: true })
  conditions: Record<string, any>; // Condiciones adicionales opcionales

  @Column({ default: 'allow' })
  effect: 'allow' | 'deny';

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  description: string; // Descripción del permiso para admin
} 
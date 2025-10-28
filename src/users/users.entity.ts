import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  COORDINADOR = 'Coordinador',
  AUXILIAR = 'Auxiliar',
  CONSULTOR = 'Consultor',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSULTOR,
  })
  role: UserRole;
}

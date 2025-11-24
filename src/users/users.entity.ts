import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  COORDINADOR = 'Coordinador',
  AUXILIAR = 'Auxiliar',
  CONSULTOR = 'Consultor',
}

// Registrar el enum para GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Roles disponibles para usuarios',
});

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Column()
  password: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSULTOR,
  })
  role: UserRole;
}

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('boxes')
export class Box {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  name: string;

  @Column('int')
  altura: number;

  @Column('int')
  largura: number;

  @Column('int')
  comprimento: number;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // Use simple-json for SQLite compatibility (serializes to TEXT under the hood)
  @Column('simple-json')
  items: any;

  // Use real for SQLite; if you need exact currency math, consider storing cents as integer
  @Column('real')
  total: number;

  // Precise currency handling in integer cents
  @Column('integer', { nullable: true })
  totalCents: number | null;

  @CreateDateColumn()
  createdAt: Date;
}

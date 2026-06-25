import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

export enum HotelStatus {
  Active = 'Actif',
  Maintenance = 'Maintenance',
  Closed = 'Ferme',
}

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column({ type: 'integer' })
  stars: number;

  @Column({ type: 'text', default: HotelStatus.Active })
  status: HotelStatus;

  @OneToMany(() => Room, (room) => room.hotel, { cascade: true })
  rooms: Room[];
}

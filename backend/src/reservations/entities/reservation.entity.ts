import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';

export enum ReservationStatus {
  Pending = 'En attente',
  Confirmed = 'Confirme',
  Cancelled = 'Annule',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  arrivalDate: Date;

  @Column({ type: 'datetime' })
  departureDate: Date;

  @Column({ type: 'integer' })
  totalAmount: number;

  @Column({ type: 'integer', default: 1 })
  adults: number;

  @Column({ type: 'integer', default: 0 })
  children: number;

  @Column({ type: 'text', default: ReservationStatus.Pending })
  status: ReservationStatus;

  @ManyToOne(() => User, (user) => user.reservations, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Room, (room) => room.reservations, { eager: true, onDelete: 'CASCADE' })
  room: Room;
}

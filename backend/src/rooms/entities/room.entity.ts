import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ type: 'integer' })
  pricePerNight: number;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { eager: true, onDelete: 'CASCADE' })
  hotel: Hotel;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];
}

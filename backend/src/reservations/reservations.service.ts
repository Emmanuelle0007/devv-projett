import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const user = await this.usersService.findOne(createReservationDto.userId);
    const room = await this.roomsService.findOne(createReservationDto.roomId);

    if (!room.available) {
      throw new BadRequestException('Cette chambre est indisponible.');
    }

    const arrivalDate = new Date(createReservationDto.arrivalDate);
    const departureDate = new Date(createReservationDto.departureDate);
    const adults = createReservationDto.adults || 1;
    const children = createReservationDto.children || 0;

    const totalAmount = this.calculateTotal(arrivalDate, departureDate, room.pricePerNight, adults, children);

    return this.reservationsRepository.save(
      this.reservationsRepository.create({ user, room, arrivalDate, departureDate, totalAmount, adults, children }),
    );
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find();
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation introuvable.');
    }
    return reservation;
  }

  async findByUser(userId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({ where: { user: { id: userId } } });
  }

  async update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (updateReservationDto.userId) {
      reservation.user = await this.usersService.findOne(updateReservationDto.userId);
    }
    if (updateReservationDto.roomId) {
      reservation.room = await this.roomsService.findOne(updateReservationDto.roomId);
    }
    if (updateReservationDto.arrivalDate) {
      reservation.arrivalDate = new Date(updateReservationDto.arrivalDate);
    }
    if (updateReservationDto.departureDate) {
      reservation.departureDate = new Date(updateReservationDto.departureDate);
    }
    if (updateReservationDto.status) {
      reservation.status = updateReservationDto.status;
    }

    if (updateReservationDto.adults !== undefined) {
      reservation.adults = updateReservationDto.adults;
    }
    if (updateReservationDto.children !== undefined) {
      reservation.children = updateReservationDto.children;
    }

    reservation.totalAmount = this.calculateTotal(
      reservation.arrivalDate,
      reservation.departureDate,
      reservation.room.pricePerNight,
      reservation.adults,
      reservation.children
    );
    return this.reservationsRepository.save(reservation);
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationsRepository.remove(reservation);
  }

  private calculateTotal(arrivalDate: Date, departureDate: Date, pricePerNight: number, adults: number, children: number): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / millisecondsPerDay);
    if (nights <= 0) {
      throw new BadRequestException('La date de depart doit etre apres la date arrivee.');
    }
    const totalPeople = adults + children;
    let extraSupplement = 0;
    if (totalPeople > 4) {
      extraSupplement = (totalPeople - 4) * 10000;
    }
    return nights * (pricePerNight + extraSupplement);
  }
}

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { HotelStatus } from '../hotels/entities/hotel.entity';
import { HotelsService } from '../hotels/hotels.service';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly hotelsService: HotelsService,
    private readonly roomsService: RoomsService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedHotelsAndRooms();
  }

  private async seedAdmin() {
    const existingAdmin = await this.usersService.findByEmail('admin@irma.com');
    if (existingAdmin) {
      return;
    }

    await this.usersService.create({
      name: 'Admin',
      email: 'admin@irma.com',
      password: 'admin123',
      role: Role.Admin,
      isActive: true,
    });
    this.logger.log('Compte admin cree: admin@irma.com / admin123');
  }

  private async seedHotelsAndRooms() {
    const existingHotels = await this.hotelsService.findAll();
    if (existingHotels.length > 0) {
      return;
    }

    const plaza = await this.hotelsService.create({
      name: 'Plaza Athenee',
      city: 'Paris',
      stars: 5,
      status: HotelStatus.Active,
    });
    const ritz = await this.hotelsService.create({
      name: 'Le Ritz Londres',
      city: 'Londres',
      stars: 5,
      status: HotelStatus.Active,
    });
    const burj = await this.hotelsService.create({
      name: 'Burj Al Arab',
      city: 'Dubai',
      stars: 5,
      status: HotelStatus.Active,
    });

    await Promise.all([
      this.roomsService.create({ hotelId: plaza.id, type: 'Suite Presidentielle', pricePerNight: 850 }),
      this.roomsService.create({ hotelId: plaza.id, type: 'Chambre Deluxe', pricePerNight: 420 }),
      this.roomsService.create({ hotelId: ritz.id, type: 'Suite Royale', pricePerNight: 770, available: false }),
      this.roomsService.create({ hotelId: burj.id, type: 'Suite Royale Duplex', pricePerNight: 1780 }),
    ]);
    this.logger.log('Hotels et chambres de demonstration crees.');
  }
}

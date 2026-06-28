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

    const hotelsData = [
      { city: 'Paris', name: 'Le Grand Palais', stars: 5, type: 'Suite Royale', price: 9999 },
      { city: 'Dakar', name: 'Radisson Blu Dakar', stars: 4, type: 'Chambre Prestige', price: 1120 },
      { city: 'Dubai', name: 'Burj Al Arab', stars: 5, type: 'Chambre Royale', price: 7590 },
      { city: 'Brazzaville', name: 'Les Tours Jumelles', stars: 4, type: 'Villa Exclusive', price: 4590 },
      { city: 'Tokyo', name: 'Park Hyatt', stars: 5, type: 'Hotel Luxueux', price: 9459 },
      { city: 'Londres', name: 'The Savoy', stars: 5, type: 'Suite Royale', price: 4259 },
      { city: 'Marrakech', name: 'Four Seasons', stars: 5, type: 'Jardin Suite', price: 1859 },
      { city: 'Bangkok', name: 'Mandarin Oriental', stars: 5, type: 'River View Suite', price: 2950 },
      { city: 'Rio', name: 'Belmond Copacabana', stars: 5, type: 'Ocean Front', price: 2659 },
    ];

    for (const h of hotelsData) {
      const hotel = await this.hotelsService.create({
        name: h.name,
        city: h.city,
        stars: h.stars,
        status: HotelStatus.Active,
      });
      await this.roomsService.create({
        hotelId: hotel.id,
        type: h.type,
        pricePerNight: h.price,
      });
    }
    this.logger.log('Hotels et chambres de demonstration crees.');
  }
}

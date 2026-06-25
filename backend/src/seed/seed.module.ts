import { Module } from '@nestjs/common';
import { HotelsModule } from '../hotels/hotels.module';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, HotelsModule, RoomsModule],
  providers: [SeedService],
})
export class SeedModule {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelsService } from '../hotels/hotels.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    private readonly hotelsService: HotelsService,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const hotel = await this.hotelsService.findOne(createRoomDto.hotelId);
    const room = this.roomsRepository.create({ ...createRoomDto, hotel });
    return this.roomsRepository.save(room);
  }

  findAll(): Promise<Room[]> {
    return this.roomsRepository.find();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException('Chambre introuvable.');
    }
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    if (updateRoomDto.hotelId) {
      room.hotel = await this.hotelsService.findOne(updateRoomDto.hotelId);
    }
    Object.assign(room, {
      type: updateRoomDto.type ?? room.type,
      pricePerNight: updateRoomDto.pricePerNight ?? room.pricePerNight,
      available: updateRoomDto.available ?? room.available,
    });
    return this.roomsRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomsRepository.remove(room);
  }
}

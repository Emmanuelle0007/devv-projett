import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelsRepository: Repository<Hotel>,
  ) {}

  create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    return this.hotelsRepository.save(this.hotelsRepository.create(createHotelDto));
  }

  findAll(): Promise<Hotel[]> {
    return this.hotelsRepository.find({ relations: { rooms: true } });
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id },
      relations: { rooms: true },
    });
    if (!hotel) {
      throw new NotFoundException('Hotel introuvable.');
    }
    return hotel;
  }

  async update(id: number, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    const hotel = await this.findOne(id);
    Object.assign(hotel, updateHotelDto);
    return this.hotelsRepository.save(hotel);
  }

  async remove(id: number): Promise<void> {
    const hotel = await this.findOne(id);
    await this.hotelsRepository.remove(hotel);
  }
}

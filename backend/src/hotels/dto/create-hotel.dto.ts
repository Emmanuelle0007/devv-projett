import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { HotelStatus } from '../entities/hotel.entity';

export class CreateHotelDto {
  @ApiProperty({ example: 'Plaza Athenee' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiProperty({ enum: HotelStatus, default: HotelStatus.Active })
  @IsOptional()
  @IsEnum(HotelStatus)
  status?: HotelStatus;
}

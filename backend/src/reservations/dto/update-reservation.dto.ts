import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiProperty({ example: '2026-07-15' })
  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @ApiProperty({ example: '2026-07-20' })
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @ApiProperty({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}

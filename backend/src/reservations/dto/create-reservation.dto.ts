import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  roomId: number;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  arrivalDate: string;

  @ApiProperty({ example: '2026-07-20' })
  @IsDateString()
  departureDate: string;
}

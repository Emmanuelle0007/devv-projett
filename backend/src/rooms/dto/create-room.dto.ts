import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  hotelId: number;

  @ApiProperty({ example: 'Suite Presidentielle' })
  @IsString()
  type: string;

  @ApiProperty({ example: 850 })
  @IsInt()
  @Min(1)
  pricePerNight: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

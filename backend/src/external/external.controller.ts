import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExternalService } from './external.service';

@ApiTags('external')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Get('countries/:countryName')
  getCountryInfo(@Param('countryName') countryName: string) {
    return this.externalService.getCountryInfo(countryName);
  }
}

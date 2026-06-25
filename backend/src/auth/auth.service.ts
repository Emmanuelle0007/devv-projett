import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: Role.User,
    });
    return this.buildAuthResponse(user.id, user.email, user.name, user.role);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    const passwordMatches = user && (await bcrypt.compare(loginDto.password, user.password));

    if (!user || !passwordMatches || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    return this.buildAuthResponse(user.id, user.email, user.name, user.role);
  }

  private buildAuthResponse(id: number, email: string, name: string, role: Role) {
    return {
      accessToken: this.jwtService.sign({ sub: id, email, role }),
      user: { id, email, name, role },
    };
  }
}

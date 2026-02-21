import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !compareSync(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return { accessToken: token, user: { id: user.id, email: user.email } };
  }

  async me(userId: string) {
    return this.userRepo.findOne({ where: { id: userId }, select: ['id', 'email', 'createdAt'] });
  }
}

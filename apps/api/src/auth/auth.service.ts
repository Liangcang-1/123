import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import { TenantEntity, UserEntity } from '../database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !compareSync(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.jwtService.signAsync({ sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role });
    return { ok: true, data: { accessToken: token, user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role } } };
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    const tenant = user.tenantId ? await this.tenantRepo.findOne({ where: { id: user.tenantId } }) : null;
    return { ok: true, data: { user: { id: user.id, email: user.email, role: user.role }, tenant } };
  }
}

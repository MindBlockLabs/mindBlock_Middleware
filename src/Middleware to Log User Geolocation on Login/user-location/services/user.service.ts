import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserLocation } from '../entities/user-location.entity';
import { CreateUserLocationDto } from '../dto/user-location.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLocation)
    private readonly userLocationRepository: Repository<UserLocation>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async updateLastLoginInfo(
    userId: string,
    ipAddress: string,
    country: string,
    region: string,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginIp: ipAddress,
      lastLoginCountry: country,
      lastLoginRegion: region,
    });
  }

  async createUserLocation(createLocationDto: CreateUserLocationDto): Promise<UserLocation> {
    const userLocation = this.userLocationRepository.create(createLocationDto);
    return this.userLocationRepository.save(userLocation);
  }

  async getUserLocationHistory(userId: string): Promise<UserLocation[]> {
    return this.userLocationRepository.find({
      where: { userId },
      order: { loginAt: 'DESC' },
      take: 10, // Last 10 login locations
    });
  }

  async getLocationAnalytics(userId: string) {
    const locations = await this.userLocationRepository
      .createQueryBuilder('location')
      .select([
        'location.country',
        'location.city',
        'COUNT(*) as loginCount',
        'MAX(location.loginAt) as lastLogin',
      ])
      .where('location.userId = :userId', { userId })
      .groupBy('location.country, location.city')
      .orderBy('loginCount', 'DESC')
      .getRawMany();

    return locations;
  }

  // Create a sample user for testing
  async createUser(email: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    return this.userRepository.save(user);
  }
}
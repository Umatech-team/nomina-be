import { User } from '@modules/member/entities/Member';
import { UserRepository } from '@modules/member/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserMapper } from './MemberMapper';

@Injectable()
export class UserRepositoryImplementation implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user ? UserMapper.toEntity(user) : null;
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: UserMapper.toPrisma(user),
    });
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: user.id as number,
      },
      data: UserMapper.toPrisma(user),
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async findUniqueByName(name: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        name,
      },
    });

    return user ? UserMapper.toEntity(user) : null;
  }
}

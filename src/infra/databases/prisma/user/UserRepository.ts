import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MemberMapper } from './UserMapper';

@Injectable()
export class UserRepositoryImplementation implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user ? MemberMapper.toEntity(user) : null;
  }

  async findUniqueByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user ? MemberMapper.toEntity(user) : null;
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: MemberMapper.toPrisma(user),
    });
    await this.prisma.workspace.create({
      data: 
    })
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: MemberMapper.toPrisma(user),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

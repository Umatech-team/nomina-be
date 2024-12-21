import { Member } from '@modules/member/entities/Member';
import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MemberMapper } from './MemberMapper';

@Injectable()
export class MemberRepositoryImplementation implements MemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueById(id: number): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: {
        id,
      },
    });

    return member ? MemberMapper.toEntity(member) : null;
  }

  async findUniqueByEmail(email: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: {
        email,
      },
    });

    return member ? MemberMapper.toEntity(member) : null;
  }

  async create(member: Member): Promise<void> {
    await this.prisma.member.create({
      data: MemberMapper.toPrisma(member),
    });
  }

  async update(member: Member): Promise<void> {
    await this.prisma.member.update({
      where: {
        id: member.id as number,
      },
      data: MemberMapper.toPrisma(member),
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.member.delete({
      where: {
        id,
      },
    });
  }
}

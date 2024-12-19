import { Member } from '@modules/member/entities/Member';
import { Member as MemberPrisma, Prisma } from '@prisma/client';

export class MemberMapper {
  static toEntity(raw: MemberPrisma): Member {
    return new Member(
      {
        name: raw.name,
        email: raw.email,
        plan: raw.plan,
        phone: raw.phone ?? '',
        planStartDate: raw.planStartDate ?? new Date(),
        planEndDate: raw.planEndDate,
        paymentStatus: raw.paymentStatus,
        renewalDate: raw.renewalDate,
        timezone: raw.timezone,

        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Member): Prisma.MemberUncheckedCreateInput {
    return {
      name: entity.name,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt as Date,
    };
  }
}

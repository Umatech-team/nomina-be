import { PaymentStatus, PlanType, SupportTier } from '@constants/enums';
import { Member } from '@modules/member/entities/Member';
import { Member as MemberPrisma, Prisma } from '@prisma/client';

export class MemberMapper {
  static toEntity(raw: MemberPrisma): Member {
    return new Member(
      {
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        name: raw.name,
        email: raw.email,
        phone: raw.phone ?? null,
        password: raw.password,
        plan: raw.plan as PlanType,
        planStartDate: raw.planStartDate as Date,
        planEndDate: raw.planEndDate,
        paymentStatus: raw.paymentStatus as PaymentStatus,
        renewalDate: raw.renewalDate,
        timezone: raw.timezone,
        language: raw.language,
        currency: raw.currency,
        supportTier: raw.supportTier as SupportTier,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Member): Prisma.MemberUncheckedCreateInput {
    return {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      email: entity.email,
      phone: entity.phone ?? null,
      password: entity.password,
      plan: entity.plan as PlanType,
      planStartDate: entity.planStartDate ?? null,
      planEndDate: entity.planEndDate,
      paymentStatus: entity.paymentStatus as PaymentStatus,
      renewalDate: entity.renewalDate,
      timezone: entity.timezone,
      language: entity.language,
      currency: entity.currency,
      supportTier: entity.supportTier as SupportTier,
    };
  }
}

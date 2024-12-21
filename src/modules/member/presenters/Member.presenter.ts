import { Member } from '../entities/Member';

export class MemberPresenter {
  static toHTTP(member: Member) {
    return {
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      password: member.password,
      plan: member.plan,
      planStartDate: member.planStartDate,
      planEndDate: member.planEndDate,
      paymentStatus: member.paymentStatus,
      renewalDate: member.renewalDate,
      timezone: member.timezone,
      language: member.language,
      currency: member.currency,
      supportTier: member.supportTier,
    };
  }
}

import { PaymentStatus, PlanType, SupportTier } from '@constants/enums';
import { Member } from './User';

describe('Member Entity', () => {
  it('should create a member with default values', () => {
    const member = new Member({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    expect(member.name).toBe('John Doe');
    expect(member.email).toBe('john.doe@example.com');
    expect(member.password).toBe('password123');
    expect(member.createdAt).toBeInstanceOf(Date);
    expect(member.updatedAt).toBeNull();
    expect(member.phone).toBeNull();
    expect(member.plan).toBe(PlanType.FREE);
    expect(member.planStartDate).toBeInstanceOf(Date);
    expect(member.planEndDate).toBeNull();
    expect(member.paymentStatus).toBe(PaymentStatus.PAID);
    expect(member.renewalDate).toBeNull();
    expect(member.language).toBe('pt-BR');
    expect(member.timezone).toBe('America/Sao_Paulo');
    expect(member.currency).toBe('BRL');
    expect(member.supportTier).toBe(SupportTier.STANDARD);
  });

  it('should update member properties and touch updatedAt', () => {
    const member = new Member({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    const newName = 'Jane Doe';
    const newEmail = 'jane.doe@example.com';
    const newPhone = '1234567890';
    const newPassword = 'newpassword123';
    const newPlan = PlanType.FREE;
    const newPlanStartDate = new Date();
    const newPlanEndDate = null;
    const newPaymentStatus = PaymentStatus.FAILED;
    const newRenewalDate = new Date();
    const newTimezone = 'America/New_York';
    const newLanguage = 'en-US';
    const newCurrency = 'USD';
    const newSupportTier = SupportTier.STANDARD;

    member.name = newName;
    member.email = newEmail;
    member.phone = newPhone;
    member.password = newPassword;
    member.plan = newPlan;
    member.planStartDate = newPlanStartDate;
    member.paymentStatus = newPaymentStatus;
    member.renewalDate = newRenewalDate;
    member.timezone = newTimezone;
    member.language = newLanguage;
    member.currency = newCurrency;
    member.supportTier = newSupportTier;

    expect(member.name).toBe(newName);
    expect(member.email).toBe(newEmail);
    expect(member.phone).toBe(newPhone);
    expect(member.password).toBe(newPassword);
    expect(member.plan).toBe(newPlan);
    expect(member.planStartDate).toBe(newPlanStartDate);
    expect(member.planEndDate).toBe(newPlanEndDate);
    expect(member.paymentStatus).toBe(newPaymentStatus);
    expect(member.renewalDate).toBe(newRenewalDate);
    expect(member.timezone).toBe(newTimezone);
    expect(member.language).toBe(newLanguage);
    expect(member.currency).toBe(newCurrency);
    expect(member.supportTier).toBe(newSupportTier);
    expect(member.updatedAt).toBeInstanceOf(Date);
  });
});

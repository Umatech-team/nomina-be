import { PaymentStatus, PlanType, SupportTier } from '@constants/enums';
import { User } from './User';

describe('User Entity', () => {
  it('should create a user with default values', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
    expect(user.password).toBe('password123');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeNull();
    expect(user.phone).toBeNull();
    expect(user.plan).toBe(PlanType.FREE);
    expect(user.planStartDate).toBeInstanceOf(Date);
    expect(user.planEndDate).toBeNull();
    expect(user.paymentStatus).toBe(PaymentStatus.PAID);
    expect(user.renewalDate).toBeNull();
    expect(user.language).toBe('pt-BR');
    expect(user.timezone).toBe('America/Sao_Paulo');
    expect(user.currency).toBe('BRL');
    expect(user.supportTier).toBe(SupportTier.STANDARD);
  });

  it('should update user properties and touch updatedAt', () => {
    const user = new User({
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

    user.name = newName;
    user.email = newEmail;
    user.phone = newPhone;
    user.password = newPassword;
    user.plan = newPlan;
    user.planStartDate = newPlanStartDate;
    user.paymentStatus = newPaymentStatus;
    user.renewalDate = newRenewalDate;
    user.timezone = newTimezone;
    user.language = newLanguage;
    user.currency = newCurrency;
    user.supportTier = newSupportTier;

    expect(user.name).toBe(newName);
    expect(user.email).toBe(newEmail);
    expect(user.phone).toBe(newPhone);
    expect(user.password).toBe(newPassword);
    expect(user.plan).toBe(newPlan);
    expect(user.planStartDate).toBe(newPlanStartDate);
    expect(user.planEndDate).toBe(newPlanEndDate);
    expect(user.paymentStatus).toBe(newPaymentStatus);
    expect(user.renewalDate).toBe(newRenewalDate);
    expect(user.timezone).toBe(newTimezone);
    expect(user.language).toBe(newLanguage);
    expect(user.currency).toBe(newCurrency);
    expect(user.supportTier).toBe(newSupportTier);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});

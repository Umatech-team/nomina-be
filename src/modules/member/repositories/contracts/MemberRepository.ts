import { Member } from '../../entities/Member';

export abstract class MemberRepository {
  abstract create(member: Member): Promise<void>;
  abstract update(member: Member): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findUniqueById(id: number): Promise<Member | null>;
  abstract findUniqueByEmail(email: string): Promise<Member | null>;
}

import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { ListCategoriesDTO } from '../dto/ListCategoriesDTO';
import { Category } from '../entities/Category';
import { CategoryRepository } from '../repositories/contracts/CategoryRepository';

type Request = ListCategoriesDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = never;

type Response = {
  categories: Category[];
  total: number;
};

@Injectable()
export class ListCategoriesService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    sub,
    page,
    pageSize,
  }: Request): Promise<Either<Errors, Response>> {
    const { categories, total } =
      await this.categoryRepository.findManyByWorkspaceId(
        sub,
        undefined,
        page,
        pageSize,
      );

    return right({
      categories,
      total,
    });
  }
}

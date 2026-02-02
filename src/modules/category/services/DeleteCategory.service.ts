import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { FindCategoryByIdDTO } from '../dto/FindCategoryByIdDTO';
import { CategoryHasChildrenError } from '../errors/CategoryHasChildrenError';
import { CategoryHasTransactionsError } from '../errors/CategoryHasTransactionsError';
import { CategoryNotFoundError } from '../errors/CategoryNotFoundError';
import { CategoryRepository } from '../repositories/contracts/CategoryRepository';

type Request = FindCategoryByIdDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors =
  | CategoryNotFoundError
  | CategoryHasChildrenError
  | CategoryHasTransactionsError;

type Response = {
  success: boolean;
};

@Injectable()
export class DeleteCategoryService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    categoryId,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    // Verificar se a categoria existe e pertence ao workspace
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      return left(new CategoryNotFoundError());
    }

    if (category.workspaceId !== sub) {
      return left(new CategoryNotFoundError());
    }

    // Verificar se tem transações vinculadas
    const transactionCount =
      await this.categoryRepository.countTransactions(categoryId);

    if (transactionCount > 0) {
      return left(new CategoryHasTransactionsError());
    }

    // Verificar se tem subcategorias
    const childrenCount =
      await this.categoryRepository.countChildren(categoryId);

    if (childrenCount > 0) {
      // Reatribuir filhos para o pai da categoria atual (ou null se for raiz)
      await this.categoryRepository.reassignChildren(
        categoryId,
        category.parentId,
      );
    }

    // Deletar a categoria
    await this.categoryRepository.delete(categoryId);

    return right({
      success: true,
    });
  }
}

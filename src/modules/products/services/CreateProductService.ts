import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    // TODO
    const existentProduct = await this.productsRepository.findByName(name);
    if (existentProduct) {
      throw new AppError('Produto já existente.');
    }

    return this.productsRepository.create({ name, price, quantity });
  }
}

export default CreateProductService;

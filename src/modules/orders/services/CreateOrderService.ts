/* eslint-disable no-unused-expressions */
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Usuário inexistente');
    }

    const foundProducts = await this.productsRepository.findAllById(products);
    if (!foundProducts.length) {
      throw new AppError('Nenhum produto encontrado');
    }

    const foundProductsIds = foundProducts.map(product => product.id);
    const inexistentProducts = products.filter(
      product => !foundProductsIds.includes(product.id),
    );
    if (inexistentProducts.length) {
      throw new AppError('Um ou mais produtos não foram encontrados.');
    }

    const productsWithUnavailableQuantities = products.filter(
      product =>
        foundProducts.filter(fp => fp.id === product.id)[0].quantity <
        product.quantity,
    );
    if (productsWithUnavailableQuantities.length) {
      throw new AppError('Um ou mais produtos não têm quantidade disponível.');
    }

    const orderProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: foundProducts.filter(fp => fp.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    const { order_products } = order;
    const orderQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        foundProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderQuantity);

    return order;
  }
}

export default CreateOrderService;

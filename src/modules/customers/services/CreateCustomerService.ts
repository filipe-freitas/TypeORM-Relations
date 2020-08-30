import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    // TODO
    const existentCustomer = await this.customersRepository.findByEmail(email);

    if (existentCustomer) {
      throw new AppError('E-mail já utilizado.');
    }

    const customer = await this.customersRepository.create({ name, email });

    return customer;
  }
}

export default CreateCustomerService;

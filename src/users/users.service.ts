import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.repository.create(createUserDto);

    return this.repository.save(user);
  }

  async findOne(id: string) {
    if (!id) {
      return null;
    }
    return await this.repository.findOne({ where: { id } });
  }

  async find(email: string) {
    const user = await this.repository.find({ where: { email } });

    return user;
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.findOne(id);

    Object.assign(user, attrs);

    return this.repository.save(user);
  }

  remove(id: string) {
    return this.repository.delete(id);
  }
}

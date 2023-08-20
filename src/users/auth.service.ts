import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from './dtos/create-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const users = await this.usersService.find(email);

    if (users.length) {
      throw new NotFoundException();
    }

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');

    const user = await this.usersService.create({ email, password: result });

    return user;
  }

  async signIn(email: string, password: string) {
    const [user] = await this.usersService.find(email);

    if (!user) {
      throw new NotFoundException();
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new NotFoundException();
    }

    return user;
  }
}

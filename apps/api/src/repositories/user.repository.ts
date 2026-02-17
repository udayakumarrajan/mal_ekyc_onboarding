import bcrypt from 'bcrypt';
import { User } from '../types';

// In-memory user storage
const users: User[] = [
  {
    id: 'USR-001',
    email: 'udayakumar.rajan@example.com',
    fullName: 'Udayakumar Rajan',
    passwordHash: bcrypt.hashSync('password123', 10)
  }
];

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = users.find(u => u.email === email);
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = users.find(u => u.id === id);
    return user || null;
  }

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      ...userData
    };
    users.push(newUser);
    return newUser;
  }
}

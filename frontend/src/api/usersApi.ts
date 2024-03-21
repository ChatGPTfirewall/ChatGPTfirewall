import { User } from '../models/User';
import Request from './Request';

export const getUser = async (auth0_id: string): Promise<User> => {
  return Request<User>({ url: `/api/user/${auth0_id}/`, method: 'GET' });
};

export const createUser = async (user: User): Promise<User> => {
  return Request<User>({ url: '/api/user/', method: 'POST', data: user });
};

export const updateUser = async (user: User): Promise<User> => {
  return Request<User>({
    url: `/api/user/${user.auth0_id}/`,
    method: 'PUT',
    data: user
  });
};

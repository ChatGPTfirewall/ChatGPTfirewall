import { Room } from '../models/Room';
import Request from './Request';

export const getRooms = (userAuth0Id: string): Promise<Room[]> => {
  return Request<Room[]>({
    url: `/api/rooms?user_auth0_id=${userAuth0Id}`,
    method: 'GET'
  });
};

export const getRoom = (roomId: string): Promise<Room> => {
  return Request<Room>({ url: `/api/rooms/${roomId}/`, method: 'GET' });
};

export const createRoom = (
  user_auth0_id: string,
  room_name: string
): Promise<Room> => {
  return Request<Room>({
    url: '/api/rooms',
    method: 'POST',
    data: { user_auth0_id: user_auth0_id, room_name: room_name }
  });
};

export const updateRoom = (room: Room): Promise<Room> => {
  return Request<Room>({
    url: `/api/rooms/${room.id}/`,
    method: 'PUT',
    data: room
  });
};

export const updateRoomFiles = (
  roomId: string,
  documentIds: string[]
): Promise<Room> => {
  return Request<Room>({
    url: `/api/rooms/${roomId}/documents/`,
    method: 'POST',
    data: { document_ids: documentIds }
  });
};

export const deleteRoom = (roomId: string): Promise<Room> => {
  return Request<Room>({ url: `/api/rooms/${roomId}/`, method: 'DELETE' });
};

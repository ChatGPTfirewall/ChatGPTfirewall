import { Room } from './Room';

export type AnonymizationMapping = {
  room: Room;
  anonymized: string;
  deanonymized: string;
  entityType: string;
};

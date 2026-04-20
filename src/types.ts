import { Timestamp } from 'firebase/firestore';

export interface JournalEntry {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  imageUrls: string[];
  userId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface User extends FirebaseUser {}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
}

import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface User extends FirebaseUser {}

export interface Message {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  answers?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export type SerializableMessage = Omit<Message, 'timestamp'> & {
  timestamp: number;
};

export interface Report {
  subject: string;
  topics: string[];
  goodAt: string[];
  needsPractice: string[];
  summary: string;
}

export interface ReportInput {
  history: SerializableMessage[];
}

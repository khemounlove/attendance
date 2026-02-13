
export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface Attendance {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  sex: Sex;
  course: string;
  date: string;
  time: string;
  attendance: Attendance;
  createdAt: number;
}

export type StudentFormData = Omit<Student, 'id' | 'createdAt'>;

export interface APIExtractionResult {
  studentId?: string;
  name?: string;
  sex?: Sex;
  course?: string;
  date?: string;
  time?: string;
  attendance?: Attendance;
}

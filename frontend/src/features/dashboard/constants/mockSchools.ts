export interface SchoolRow {
  _id: string;
  name: string;
  code: string;
  boardType: string;
  subscriptionName: string;
  maxStudents: number;
  isActive: boolean;
}

export const mockSchools: SchoolRow[] = [
  { 
    _id: 'school-1', 
    name: 'Greenwood International School', 
    code: 'GWIS', 
    boardType: 'CBSE', 
    subscriptionName: 'Premium Plan', 
    maxStudents: 1500, 
    isActive: true 
  },
  { 
    _id: 'school-2', 
    name: 'Saint Xavier Academy', 
    code: 'SXAC', 
    boardType: 'ICSE', 
    subscriptionName: 'Standard Plan', 
    maxStudents: 800, 
    isActive: true 
  },
  { 
    _id: 'school-3', 
    name: 'Delhi Public School', 
    code: 'DPS', 
    boardType: 'STATE', 
    subscriptionName: 'Basic Plan', 
    maxStudents: 500, 
    isActive: false 
  },
];

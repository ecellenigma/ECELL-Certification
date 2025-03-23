export interface Participant {
  id: string;
  email: string;
  name: string;
  rank?: number;
}

export interface Program {
  slug: string;
  logo?: string;
  name: string;
}

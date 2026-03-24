export interface LocationWithCount {
  id: string;
  name: string;
  oracleLocationId: string | null;
  address: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    screens: number;
  };
}

export interface Trip {
  _id?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  latitude: number;
  longitude: number;
}

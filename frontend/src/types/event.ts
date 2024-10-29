export enum EventType {
    CROSSPROMO = 'crosspromo',
    LIVEOPS = 'liveops',
    APP = 'app',
    ADS = 'ads',
  }
  
  export interface Event {
    id?: number;
    name: string;
    description: string;
    type: EventType;
    priority: number;
    createdAt?: string;
    updatedAt?: string;
  }
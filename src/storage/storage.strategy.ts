export interface StorageStrategy {
  connect(): Promise<any>;
  disconnect(): Promise<void>;
  getRepository(entity: any): any;
  isConnected(): boolean;
}

export interface DatabaseConnection {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  autoLoadEntities?: boolean;
  ssl?: any;
}


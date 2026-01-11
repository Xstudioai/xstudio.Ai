export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  features: string[];
}

export interface AudioContextConfig {
  sampleRate: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

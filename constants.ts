import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'NeoWatch Ultra',
    price: 299,
    description: 'El reloj inteligente definitivo con monitoreo de salud impulsado por IA y batería de 7 días.',
    image: 'https://picsum.photos/400/400?random=1',
    features: ['Monitor cardíaco', 'GPS Dual', 'Titanio Aeroespacial']
  },
  {
    id: 'p2',
    name: 'SonicBuds Pro',
    price: 199,
    description: 'Auriculares con cancelación de ruido activa de nivel estudio y audio espacial 360.',
    image: 'https://picsum.photos/400/400?random=2',
    features: ['ANC Adaptativo', '30h Batería', 'Resistencia al agua IPX4']
  },
  {
    id: 'p3',
    name: 'VisionTab X',
    price: 899,
    description: 'Tablet ultradelgada para creativos profesionales con pantalla OLED de 120Hz.',
    image: 'https://picsum.photos/400/400?random=3',
    features: ['Chip M-Core', 'Pantalla OLED', 'Soporte Stylus']
  }
];

export const SYSTEM_INSTRUCTION = `
Eres Alex, un vendedor experto y carismático de la tienda online "TechVibe".
Tu trabajo es atender a los clientes mediante voz, responder sus dudas y venderles los productos de la tienda.
Habla siempre en español de manera fluida, amable y profesional, pero con energía.
Tus respuestas deben ser concisas (máximo 2-3 frases) para mantener una conversación dinámica.
Si el usuario selecciona un producto, céntrate en sus beneficios clave y trata de cerrar la venta.
No inventes productos que no estén en el catálogo.
`;

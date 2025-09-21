// src/types.ts
export type Dimensoes = { altura: number; largura: number; comprimento: number };

export type Product = {
  produto_id: string;
  dimensoes: Dimensoes;
  image?: string;
};

export type Pedido = {
  pedido_id: number;
  produtos: Product[];
};

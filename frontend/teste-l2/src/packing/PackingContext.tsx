// src/packing/PackingContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { Pedido, Product } from '../types';

type PackingContextValue = {
  pedidos: Pedido[];
  activePedidoId: number;
  setActivePedido: (id: number) => void;
  addPedido: () => number; // retorna novo id
  addToActive: (p: Product) => void;
  removeFromPedido: (pedidoId: number, index: number) => void;
  clearPedido: (pedidoId: number) => void;
  clearAll: () => void;
  totalItens: number;
};

const PackingContext = createContext<PackingContextValue | undefined>(undefined);

function newPedidoId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function PackingProvider({ children }: { children: React.ReactNode }) {
  const initialId = newPedidoId();
  const [pedidos, setPedidos] = useState<Pedido[]>([{ pedido_id: initialId, produtos: [] }]);
  const [activePedidoId, setActivePedidoId] = useState<number>(initialId);

  const setActivePedido = (id: number) => setActivePedidoId(id);

  const addPedido = () => {
    const id = newPedidoId();
    setPedidos(prev => [...prev, { pedido_id: id, produtos: [] }]);
    setActivePedidoId(id);
    return id;
  };

  const addToActive = (p: Product) => {
    setPedidos(prev =>
      prev.map(pd =>
        pd.pedido_id === activePedidoId
          ? { ...pd, produtos: [...pd.produtos, p] }
          : pd
      )
    );
  };

  const removeFromPedido = (pedidoId: number, index: number) => {
    setPedidos(prev =>
      prev.map(pd =>
        pd.pedido_id === pedidoId
          ? { ...pd, produtos: pd.produtos.filter((_, i) => i !== index) }
          : pd
      )
    );
  };

  const clearPedido = (pedidoId: number) => {
    setPedidos(prev =>
      prev.map(pd => (pd.pedido_id === pedidoId ? { ...pd, produtos: [] } : pd))
    );
  };

  const clearAll = () => {
    const id = newPedidoId();
    setPedidos([{ pedido_id: id, produtos: [] }]);
    setActivePedidoId(id);
  };

  const totalItens = pedidos.reduce((acc, p) => acc + p.produtos.length, 0);

  const value = useMemo(
    () => ({
      pedidos,
      activePedidoId,
      setActivePedido,
      addPedido,
      addToActive,
      removeFromPedido,
      clearPedido,
      clearAll,
      totalItens,
    }),
    [pedidos, activePedidoId, totalItens]
  );

  return <PackingContext.Provider value={value}>{children}</PackingContext.Provider>;
}

export function usePacking() {
  const ctx = useContext(PackingContext);
  if (!ctx) throw new Error('usePacking must be used within PackingProvider');
  return ctx;
}

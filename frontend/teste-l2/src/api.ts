// src/api.ts
import { Pedido } from './types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const DEBUG = import.meta.env.DEV; // só loga no dev

export async function packPedidos(pedidos: Pedido[], apiKey?: string | null) {
  const payload = { pedidos };

  // pega do login ou do .env
  const key = (apiKey ?? (import.meta as any)?.env?.VITE_API_KEY ?? null) as string | null;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['x-api-key'] = String(key).trim();

  if (DEBUG) {
    console.log('[packPedidos] URL:', `${BACKEND_URL}/orders/pack`);
    console.log('[packPedidos] headers:', headers);
    console.log('[packPedidos] payload:', payload);
  }

  const res = await fetch(`${BACKEND_URL}/orders/pack`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (DEBUG) {
      console.log('[packPedidos] status:', res.status);
      console.log('[packPedidos] response text:', text);
    }
    throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
  }
  const json = await res.json();
  if (DEBUG) console.log('[packPedidos] response json:', json);
  return json;
}

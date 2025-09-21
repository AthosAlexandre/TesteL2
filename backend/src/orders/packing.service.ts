// src/orders/packing.service.ts
import { Injectable } from '@nestjs/common';
import { PackOrdersDto, Dim } from './dto/pack-orders.dto';

type Produto = { produto_id: string; dimensoes: Dim };
type Caixa = {
  id: string;
  altura: number;
  largura: number;
  comprimento: number;
};

const BOXES: Caixa[] = [
  { id: 'Caixa 1', altura: 30, largura: 40, comprimento: 80 },
  { id: 'Caixa 2', altura: 50, largura: 50, comprimento: 40 },
  { id: 'Caixa 3', altura: 50, largura: 80, comprimento: 60 },
];

function baseOrientations(p: Produto) {
  const { largura, comprimento } = p.dimensoes;
  return [
    { w: largura, h: comprimento },
    { w: comprimento, h: largura },
  ];
}

function packOnBaseShelf(produtos: Produto[], box: Caixa): number[] {
  const candidates = produtos
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.dimensoes.altura <= box.altura);

  candidates.sort((a, b) => {
    const aMax = Math.max(a.p.dimensoes.largura, a.p.dimensoes.comprimento);
    const bMax = Math.max(b.p.dimensoes.largura, b.p.dimensoes.comprimento);
    return bMax - aMax;
  });

  let usedLength = 0;
  const placed: number[] = [];

  for (const { p, idx } of candidates) {
    if (placed.includes(idx)) continue;
    let placedThis = false;

    if (placed.length === 0) {
      let shelfWidthUsed = 0;
      let shelfHeight = 0;

      const ori = baseOrientations(p);
      const fit = ori.find((o) => o.w <= box.largura && o.h <= box.comprimento);
      if (!fit) continue;
      shelfWidthUsed = fit.w;
      shelfHeight = fit.h;
      placed.push(idx);

      for (const { p: q, idx: qIdx } of candidates) {
        if (placed.includes(qIdx) || q.dimensoes.altura > box.altura) continue;
        const qori = baseOrientations(q);
        const qfitSameShelf = qori.find(
          (o) =>
            o.w + shelfWidthUsed <= box.largura &&
            Math.max(o.h, shelfHeight) <= box.comprimento,
        );
        if (qfitSameShelf) {
          shelfWidthUsed += qfitSameShelf.w;
          shelfHeight = Math.max(shelfHeight, qfitSameShelf.h);
          placed.push(qIdx);
        }
      }

      usedLength = shelfHeight;
      placedThis = true;
    }

    if (!placedThis) {
      const ori = baseOrientations(p);
      const fit = ori.find(
        (o) => o.w <= box.largura && usedLength + o.h <= box.comprimento,
      );
      if (!fit) continue;

      usedLength += fit.h;
      placed.push(idx);
    }
  }

  return placed;
}

function packPedidoEmCaixas(produtos: Produto[]): {
  caixa_id: string | null; produtos: string[]; observacao?: string
}[] {
  const result: { caixa_id: string | null; produtos: string[]; observacao?: string }[] = [];
  let remaining = [...produtos];

  while (remaining.length > 0) {
    let packedThisRound = false;

    for (const box of BOXES) {
      const indices = packOnBaseShelf(remaining, box);

      if (indices.length > 0) {
        const packedNames = indices.map(i => remaining[i].produto_id);
        result.push({ caixa_id: box.id, produtos: packedNames });

        const toRemove = new Set(indices);
        remaining = remaining.filter((_, i) => !toRemove.has(i));

        packedThisRound = true;
        break; 
      }
    }

    if (!packedThisRound) {
      const p = remaining[0];
      result.push({
        caixa_id: null,
        produtos: [p.produto_id],
        observacao: 'Produto não cabe em nenhuma caixa disponível.',
      });
      remaining = remaining.slice(1);
    }
  }

  return result;
}

@Injectable()
export class PackingService {
  pack(dto: PackOrdersDto) {
    return {
      pedidos: dto.pedidos.map((p) => ({
        pedido_id: p.pedido_id,
        caixas: packPedidoEmCaixas(p.produtos as Produto[]),
      })),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PackOrdersDto, Dim } from './dto/pack-orders.dto';

type Produto = { produto_id: string; dimensoes: Dim };
type Caixa = { id: string; altura: number; largura: number; comprimento: number };

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

function packOnBaseShelf(produtos: Produto[], box: Caixa, seedIndex?: number): number[] {
  const candidates = produtos
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.dimensoes.altura <= box.altura);

  if (seedIndex !== undefined) {
    const pos = candidates.findIndex((c) => c.idx === seedIndex);
    if (pos >= 0) {
      const [seed] = candidates.splice(pos, 1);
      candidates.unshift(seed);
    }
  }

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
      // primeira shelf
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

function boxesThatFit(p: Produto): Caixa[] {
  const fits: Caixa[] = [];
  for (const b of BOXES) {
    if (p.dimensoes.altura > b.altura) continue;
    const ori = baseOrientations(p);
    if (ori.some((o) => o.w <= b.largura && o.h <= b.comprimento)) {
      fits.push(b);
    }
  }
  return fits;
}

function fitsAllInBox(produtos: Produto[], box: Caixa): boolean {
  if (produtos.length === 0) return false;
  const placed = packOnBaseShelf(produtos, box);
  return placed.length === produtos.length;
}

function packPedidoEmCaixas(produtos: Produto[]): {
  caixa_id: string | null; produtos: string[]; observacao?: string
}[] {
  const result: { caixa_id: string | null; produtos: string[]; observacao?: string }[] = [];
  let remaining = [...produtos];

  while (remaining.length > 0) {
   
    const scored = remaining.map((p, idx) => {
      const fits = boxesThatFit(p);
      const area = p.dimensoes.largura * p.dimensoes.comprimento;
      return { p, idx, fits, fitCount: fits.length, area };
    });

    const noneFit = scored.find(s => s.fitCount === 0);
    if (noneFit) {
      result.push({
        caixa_id: null,
        produtos: [noneFit.p.produto_id],
        observacao: 'Produto não cabe em nenhuma caixa disponível.',
      });
      remaining = remaining.filter((_, i) => i !== noneFit.idx);
      continue;
    }

    scored.sort((a, b) => (a.fitCount - b.fitCount) || (b.area - a.area));
    const seed = scored[0];

    const candidateBoxes = BOXES.filter(b => seed.fits.some(f => f.id === b.id));

    let placedIndices: number[] = [];
    let usedBox: Caixa | null = null;

    for (const box of candidateBoxes) {
      const placed = packOnBaseShelf(remaining, box, seed.idx);
      if (placed.includes(seed.idx)) {
        placedIndices = placed;
        usedBox = box;
        break;
      }
    }

    if (!usedBox || placedIndices.length === 0) {

      const p = remaining[seed.idx];
      result.push({
        caixa_id: null,
        produtos: [p.produto_id],
        observacao: 'Produto não cabe em nenhuma caixa disponível.',
      });
      remaining = remaining.filter((_, i) => i !== seed.idx);
      continue;
    }

    if (usedBox.id === 'Caixa 3') {
      const placedProducts = placedIndices.map(i => remaining[i]);

      const isSmall = (p: Produto) => {
        const o = baseOrientations(p);
        return o.some(x => x.w <= 30 && x.h <= 30);
      };

      const smallProducts = placedProducts.filter(p => isSmall(p));
      const caixa1 = BOXES.find(b => b.id === 'Caixa 1')!;

      if (smallProducts.length > 0 && fitsAllInBox(smallProducts, caixa1)) {
        // separar pequenos e grandes
        const smallSet = new Set(smallProducts.map(sp => sp.produto_id));
        const keptInBox3 = placedProducts.filter(p => !smallSet.has(p.produto_id));

        if (keptInBox3.length > 0) {
          result.push({
            caixa_id: usedBox.id,
            produtos: keptInBox3.map(p => p.produto_id),
          });
        }

        result.push({
          caixa_id: caixa1.id,
          produtos: smallProducts.map(p => p.produto_id),
        });

        const allocatedIds = new Set([...keptInBox3, ...smallProducts].map(p => p.produto_id));
        remaining = remaining.filter(p => !allocatedIds.has(p.produto_id));
        continue;
      }
    }

    result.push({
      caixa_id: usedBox.id,
      produtos: placedIndices.map(i => remaining[i].produto_id),
    });

    const rm = new Set(placedIndices);
    remaining = remaining.filter((_, i) => !rm.has(i));
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Box } from '../boxes/box.entity';
import { PackOrdersDto, Dim } from './dto/pack-orders.dto';

type PackedBox = { caixa_id: string | null; produtos: string[]; _usedVolume: number; _layers: number[] };
type PackResult = { pedido_id: number; caixas: { caixa_id: string | null; produtos: string[]; observacao?: string }[] };

@Injectable()
export class PackingService {
  constructor(@InjectRepository(Box) private readonly boxRepo: Repository<Box>) {}

  private volume(d: Dim) { return d.altura * d.largura * d.comprimento; }

  private permutations(d: Dim): Dim[] {
    const { altura: a, largura: l, comprimento: c } = d;
    const perms = [
      { altura: a, largura: l, comprimento: c },
      { altura: a, largura: c, comprimento: l },
      { altura: l, largura: a, comprimento: c },
      { altura: l, largura: c, comprimento: a },
      { altura: c, largura: a, comprimento: l },
      { altura: c, largura: l, comprimento: a },
    ];
    const seen = new Set<string>();
    return perms.filter(p => {
      const k = `${p.altura}-${p.largura}-${p.comprimento}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }

  private fits(prod: Dim, box: Dim): boolean {
    return this.permutations(prod).some(p =>
      p.altura <= box.altura && p.largura <= box.largura && p.comprimento <= box.comprimento
    );
  }

  private sortBoxesSmallestFirst(boxes: Box[]) {
    return [...boxes].sort((b1, b2) => {
      const v1 = b1.altura * b1.largura * b1.comprimento;
      const v2 = b2.altura * b2.largura * b2.comprimento;
      return v1 - v2;
    });
  }

  async pack(input: PackOrdersDto): Promise<{ pedidos: PackResult[] }> {
    const boxes = await this.boxRepo.find();
    const boxesAsc = this.sortBoxesSmallestFirst(boxes);

    const pedidos: PackResult[] = [];
    for (const pedido of input.pedidos) {
      const result: PackResult = { pedido_id: pedido.pedido_id, caixas: [] };
      const opened: (PackedBox & { _boxDef: Box })[] = [];

      const prods = [...pedido.produtos].sort((a, b) =>
        this.volume(b.dimensoes) - this.volume(a.dimensoes)
      );

      for (const prod of prods) {
        const prodVol = this.volume(prod.dimensoes);

        let placed = false;
        for (const ob of opened.sort((a,b)=>a._boxDef.id-b._boxDef.id)) {
          const boxDim: Dim = ob._boxDef;
          if (!this.fits(prod.dimensoes, boxDim)) continue;
          if (ob._usedVolume + prodVol > (boxDim.altura*boxDim.largura*boxDim.comprimento)) continue;

          const permutations = this.permutations(prod.dimensoes);
          const ok = permutations.some(p => {
            const dimsBox = [boxDim.altura, boxDim.largura, boxDim.comprimento].sort((x,y)=>y-x);
            const dimsProd = [p.altura, p.largura, p.comprimento].sort((x,y)=>y-x);
            const fitsAxis = dimsProd[0] <= dimsBox[0];
            if (!fitsAxis) return false;
            const used = (ob._layers[0] ?? 0);
            const layerNeed = dimsProd[1] + dimsProd[2];
            if (used + layerNeed <= (dimsBox[1] + dimsBox[2])) {
              ob._layers[0] = used + layerNeed;
              return true;
            }
            return false;
          });

          if (!ok) continue;

          ob.produtos.push(prod.produto_id);
          ob._usedVolume += prodVol;
          placed = true;
          break;
        }
        if (placed) continue;

        const box = boxesAsc.find(b => this.fits(prod.dimensoes, b));
        if (!box) {
          result.caixas.push({
            caixa_id: null,
            produtos: [prod.produto_id],
            observacao: 'Produto não cabe em nenhuma caixa disponível.',
          });
          continue;
        }
        const newBox: PackedBox & { _boxDef: Box } = {
          caixa_id: box.name,
          produtos: [prod.produto_id],
          _usedVolume: prodVol,
          _layers: [0],
          _boxDef: box,
        };
        opened.push(newBox);
      }

      for (const ob of opened) {
        result.caixas.push({ caixa_id: ob.caixa_id, produtos: ob.produtos });
      }

      pedidos.push(result);
    }
    return { pedidos };
  }
}

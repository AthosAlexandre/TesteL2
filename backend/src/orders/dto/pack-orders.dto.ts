import { ApiProperty } from '@nestjs/swagger';

export type Dim = { altura: number; largura: number; comprimento: number };

export class ProdutoDto {
  @ApiProperty() produto_id: string;
  @ApiProperty() dimensoes: Dim;
}
export class PedidoDto {
  @ApiProperty() pedido_id: number;
  @ApiProperty({ type: [ProdutoDto] }) produtos: ProdutoDto[];
}
export class PackOrdersDto {
  @ApiProperty({ type: [PedidoDto] }) pedidos: PedidoDto[];
}

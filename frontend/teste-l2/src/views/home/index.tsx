// src/views/home/index.tsx
import React, { useMemo, useState } from 'react';
import { Input, Card, Row, Col, Button, Pagination, Empty, App as AntdApp, Space, Segmented } from 'antd';
import { PlusOutlined, FolderAddOutlined } from '@ant-design/icons';
import { PRODUCTS } from '../../data/products';
import { usePacking } from '../../packing/PackingContext';
import { Product } from '../../types';

const { Meta } = Card;
const PAGE_SIZE = 8;

export default function Home() {
  const { addToActive, addPedido, pedidos, activePedidoId, setActivePedido } = usePacking();
  const { message } = AntdApp.useApp();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => PRODUCTS.filter((p) => p.produto_id.toLowerCase().includes(q.trim().toLowerCase())),
    [q]
  );

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const onAdd = (p: Product) => {
    addToActive(p);
    message.success(`Adicionado: ${p.produto_id} (Pedido ${activePedidoId})`);
  };

  const pedidoOptions = pedidos.map(p => ({ label: `Pedido ${p.pedido_id}`, value: p.pedido_id }));

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Buscar produto..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            enterButton
            style={{ maxWidth: 400 }}
          />
          <Segmented
            options={pedidoOptions}
            value={activePedidoId}
            onChange={(v) => setActivePedido(Number(v))}
          />
          <Button icon={<FolderAddOutlined />} onClick={() => {
            const id = addPedido();
            message.success(`Novo pedido criado: ${id}`);
          }}>
            Novo Pedido
          </Button>
        </Space>

        {pageItems.length === 0 ? (
          <Empty description="Nenhum produto encontrado" />
        ) : (
          <Row gutter={[16, 16]}>
            {pageItems.map((p) => (
              <Col key={p.produto_id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={<img alt={p.produto_id} src={p.image} style={{ height: 160, objectFit: 'cover' }} />}
                  actions={[
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd(p)}>
                      Adicionar
                    </Button>
                  ]}
                >
                  <Meta
                    title={p.produto_id}
                    description={`A:${p.dimensoes.altura} L:${p.dimensoes.largura} C:${p.dimensoes.comprimento}`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div style={{ display:'flex', justifyContent:'center' }}>
          <Pagination current={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} showSizeChanger={false} />
        </div>
      </Space>
    </div>
  );
}

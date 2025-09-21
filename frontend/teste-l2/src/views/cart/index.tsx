import React, { useState, useMemo } from 'react';
import {
  Tabs,
  Table,
  Button,
  Space,
  App as AntdApp,
  Typography,
  Empty,
  Grid,
  Tag,
  Badge,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  CheckCircleOutlined,
  ClearOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { usePacking } from '../../packing/PackingContext';
import { useAuth } from '../../auth/AuthContext';
import { packPedidos } from '../../api';

const { useBreakpoint } = Grid;

export default function Cart() {
  const { pedidos, removeFromPedido, clearPedido } = usePacking();
  const { apiKey } = useAuth();
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const screens = useBreakpoint();
  const isXs = !!screens.xs && !screens.sm;

  const totalItens = useMemo(
    () => pedidos.reduce((acc, p) => acc + p.produtos.length, 0),
    [pedidos]
  );

  const desktopColumns = [
    { title: 'Produto', dataIndex: 'produto_id', key: 'produto_id' },
    { title: 'Altura', dataIndex: ['dimensoes', 'altura'], key: 'altura', width: 90, align: 'right' as const },
    { title: 'Largura', dataIndex: ['dimensoes', 'largura'], key: 'largura', width: 90, align: 'right' as const },
    { title: 'Comprimento', dataIndex: ['dimensoes', 'comprimento'], key: 'comprimento', width: 120, align: 'right' as const },
    {
      title: 'Ação',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, __: any, idx: number, pedidoId?: number) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromPedido(pedidoId!, idx)}
        >
          Remover
        </Button>
      ),
    },
  ];

  const mobileColumns = [
    { title: 'Produto', dataIndex: 'produto_id', key: 'produto_id' },
    {
      title: 'Dimensões',
      key: 'dims',
      render: (_: any, rec: any) => {
        const d = rec?.dimensoes || {};
        return (
          <Space size={4} wrap>
            <Tag>A:{d.altura}</Tag>
            <Tag>L:{d.largura}</Tag>
            <Tag>C:{d.comprimento}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Ação',
      key: 'action',
      fixed: 'right' as const,
      width: 64,
      align: 'center' as const,
      render: (_: any, __: any, idx: number, pedidoId?: number) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeFromPedido(pedidoId!, idx)}
        />
      ),
    },
  ];

  const columns = isXs ? mobileColumns : desktopColumns;

  const onConfirmar = async () => {
    if (totalItens === 0) {
      message.warning('Adicione ao menos 1 item em algum pedido.');
      return;
    }
    try {
      setLoading(true);
      const res = await packPedidos(pedidos, apiKey);
      setLastResponse(res);
      message.success('Empacotamento calculado!');
    } catch (err: any) {
      message.error(err.message || 'Erro ao empacotar');
    } finally {
      setLoading(false);
    }
  };

  if (!pedidos.length) return <Empty description="Nenhum pedido" />;

  return (
    <div style={{ padding: isXs ? 16 : 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={isXs ? 'middle' : 'large'}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Empacotamento
        </Typography.Title>

        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <Tabs
            tabBarGutter={isXs ? 8 : 16}
            items={pedidos.map((pd) => ({
              key: String(pd.pedido_id),
              label: (
                <span className="tab-pill-wrap">
                  <Badge
                    count={pd.produtos.length}
                    showZero
                    size="small"
                    overflowCount={99}
                    offset={[8, -6]}
                  >
                    <Tooltip title={`Pedido ${pd.pedido_id} — ${pd.produtos.length} item(ns)`}>
                      <span className="tab-pill">
                        <InboxOutlined style={{ opacity: 0.9 }} />
                        {` Pedido ${pd.pedido_id}`}
                      </span>
                    </Tooltip>
                  </Badge>
                </span>
              ),
              children: (
                <>
                  <Table
                    rowKey={(row: any, i) => `${row?.produto_id}-${i}`}
                    size={isXs ? 'small' : 'middle'}
                    bordered={!isXs}
                    columns={columns.map((col: any) =>
                      col.key === 'action'
                        ? {
                          ...col,
                          render: (_: any, __: any, idx: number) =>
                            (col as any).render(_, __, idx, pd.pedido_id),
                        }
                        : col
                    )}
                    dataSource={pd.produtos}
                    pagination={false}
                    scroll={isXs ? { x: 600 } : undefined}
                    locale={{
                      emptyText: (
                        <Empty
                          image={<InboxOutlined />}
                          description="Sem itens neste pedido"
                        />
                      ) as any,
                    }}
                  />

                  <div style={{ marginTop: 12 }}>
                    <Button
                      icon={<ClearOutlined />}
                      danger
                      onClick={() => clearPedido(pd.pedido_id)}
                      size={isXs ? 'small' : 'middle'}
                    >
                      Limpar pedido
                    </Button>
                  </div>
                </>
              ),
            }))}
          />
        </div>

        <Space wrap>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={loading}
            onClick={onConfirmar}
            size={isXs ? 'middle' : 'large'}
          >
            Confirmar empacotamento (todos os pedidos)
          </Button>

          <Typography.Text type="secondary">
            Total de itens: <b>{totalItens}</b>
          </Typography.Text>
        </Space>

        {lastResponse && (
          <>
            <Typography.Title level={4} style={{ marginTop: 8 }}>
              Resposta do Backend
            </Typography.Title>
            <pre
              style={{
                background: '#0b1221',
                color: '#b7f0c0',
                padding: 16,
                borderRadius: 8,
                overflow: 'auto',
                maxHeight: 420,
              }}
            >
              {JSON.stringify(lastResponse, null, 2)}
            </pre>
          </>
        )}
      </Space>
    </div>
  );
}

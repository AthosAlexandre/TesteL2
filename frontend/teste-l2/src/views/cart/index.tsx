// src/views/cart/index.tsx
import React, { useState } from 'react';
import { Tabs, Table, Button, Space, App as AntdApp, Typography, Empty } from 'antd';
import { DeleteOutlined, CheckCircleOutlined, ClearOutlined } from '@ant-design/icons';
import { usePacking } from '../../packing/PackingContext';
import { useAuth } from '../../auth/AuthContext';
import { packPedidos } from '../../api';

export default function Cart() {
	const { pedidos, removeFromPedido, clearPedido } = usePacking();
	const { apiKey } = useAuth();
	const { message } = AntdApp.useApp();
	const [loading, setLoading] = useState(false);
	const [lastResponse, setLastResponse] = useState<any>(null);

	const columns = [
		{ title: 'Produto', dataIndex: 'produto_id', key: 'produto_id' },
		{ title: 'Altura', dataIndex: ['dimensoes', 'altura'], key: 'altura', width: 90 },
		{ title: 'Largura', dataIndex: ['dimensoes', 'largura'], key: 'largura', width: 90 },
		{ title: 'Comprimento', dataIndex: ['dimensoes', 'comprimento'], key: 'comprimento', width: 110 },
		{
			title: 'Ação',
			key: 'action',
			width: 120,
			render: (_: any, __: any, idx: number, pedidoId?: number) => (
				<Button danger icon={<DeleteOutlined />} onClick={() => removeFromPedido(pedidoId!, idx)}>
					Remover
				</Button>
			),
		},
	];

	const onConfirmar = async () => {
		const total = pedidos.reduce((acc, p) => acc + p.produtos.length, 0);
		if (total === 0) {
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
		<div style={{ padding: 24 }}>
			<Space direction="vertical" style={{ width: '100%' }} size="large">
				<Typography.Title level={3}>Empacotamento</Typography.Title>

				<Tabs
					items={pedidos.map((pd) => ({
						key: String(pd.pedido_id),
						label: `Pedido ${pd.pedido_id} (${pd.produtos.length})`,
						children: (
							<>
								<Table
									rowKey={(_, i) => String(i)}
									columns={columns.map(col =>
										col.key === 'action'
											? { ...col, render: (_: any, __: any, idx: number) => (col as any).render(_, __, idx, pd.pedido_id) }
											: col
									) as any}
									dataSource={pd.produtos}
									pagination={false}
								/>
								<div style={{ marginTop: 12 }}>
									<Button icon={<ClearOutlined />} danger onClick={() => clearPedido(pd.pedido_id)}>
										Limpar pedido
									</Button>
								</div>
							</>
						),
					}))}
				/>

				<Space>
					<Button type="primary" icon={<CheckCircleOutlined />} loading={loading} onClick={onConfirmar}>
						Confirmar empacotamento (todos os pedidos)
					</Button>
				</Space>

				{lastResponse && (
					<>
						<Typography.Title level={4}>Resposta do Backend</Typography.Title>
						<pre style={{ background: '#0b1221', color: '#b7f0c0', padding: 16, borderRadius: 8, overflow: 'auto' }}>
							{JSON.stringify(lastResponse, null, 2)}
						</pre>
					</>
				)}
			</Space>
		</div>
	);
}

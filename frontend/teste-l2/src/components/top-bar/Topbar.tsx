import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Space, Badge, Grid, Flex, Typography, Tooltip } from 'antd';
import { LogoutOutlined, HomeOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { usePacking } from '../../packing/PackingContext';

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Topbar() {
  const { email, logout } = useAuth();
  const { count } = usePacking();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isLogin = location.pathname.startsWith('/login');

  if (isLogin) return null;

  const isXs = !!screens.xs && !screens.sm;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: isXs ? '8px 12px' : '12px 16px',
      }}
    >
      <Flex align="center" wrap="wrap" gap={isXs ? 8 : 12}>
      
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <HomeOutlined />
          {!isXs && <span>Home</span>}
        </Link>

        <Flex style={{ marginLeft: 'auto' }} align="center" gap={isXs ? 8 : 12}>
          <Badge count={count} size="small">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/carrinho')}
              type={isXs ? 'default' : 'primary'}
              size={isXs ? 'small' : 'middle'}
            >
              {!isXs && 'Empacotamentos'}
            </Button>
          </Badge>

          {email ? (
            <>
              {!isXs ? (
                <Text style={{ opacity: 0.8 }} ellipsis>
                  <UserOutlined style={{ marginRight: 6 }} />
                  {email}
                </Text>
              ) : (
                <Tooltip title={email}>
                  <UserOutlined />
                </Tooltip>
              )}

              <Button
                type="primary"
                danger={isXs}
                icon={<LogoutOutlined />}
                onClick={logout}
                size={isXs ? 'small' : 'middle'}
              >
                {!isXs && 'Sair'}
              </Button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </Flex>
      </Flex>
    </div>
  );
}

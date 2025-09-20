import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import { LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';

export default function Topbar() {
  const { email, logout } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        borderBottom: '1px solid #eee',
        alignItems: 'center',
      }}
    >
      <Space size="middle" align="center">
        <Link to="/">
          <Space>
            <HomeOutlined />
            Home
          </Space>
        </Link>
      </Space>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {email ? (
          <>
            <span style={{ opacity: 0.8 }}>👤 {email}</span>
            <Button
              type="primary"
              icon={<LogoutOutlined />}  
              onClick={logout}
            >
              Sair
            </Button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}

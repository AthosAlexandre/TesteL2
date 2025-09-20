import React from 'react';
import type { FormProps } from 'antd';
import { Form, Input, Button, Checkbox, Typography, App as AntdApp } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

type FieldType = {
  email?: string;
  password?: string;
  remember?: boolean;
};

const labelStyle: React.CSSProperties = { marginBottom: 6 };

export default function Login() {
  const { message } = AntdApp.useApp();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location?.state?.from || '/';

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    login(values.email!, null);

    message.success(`Bem-vindo, ${values.email}`);
    navigate(from, { replace: true });
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Login
        </Typography.Title>

        <Form<FieldType>
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label={<span style={labelStyle}>E-mail</span>}
            name="email"
            rules={[
              { required: true, message: 'Informe seu e-mail' },
              { type: 'email', message: 'Informe um e-mail válido (ex.: usuario@dominio.com)' },
            ]}
            className="underline-input"
          >
            <Input placeholder="seu@email.com" />
          </Form.Item>

          <Form.Item<FieldType>
            label={<span style={labelStyle}>Senha</span>}
            name="password"
            rules={[{ required: true, message: 'Informe sua senha' }]}
            className="underline-input"
          >
            <Input.Password placeholder="Sua senha" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Form.Item<FieldType> name="remember" valuePropName="checked" noStyle>
              <Checkbox>Lembrar de mim</Checkbox>
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Entrar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

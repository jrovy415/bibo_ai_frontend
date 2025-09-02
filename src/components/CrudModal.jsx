import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Descriptions, message } from 'antd';

const CrudModal = ({
  visible,
  onCancel,
  mode, // 'create', 'view', 'edit', 'delete'
  title,
  data,
  fields, // Array of field configurations
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (visible && data && (mode === 'edit' || mode === 'view')) {
      form.setFieldsValue(data);
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, data, mode, form]);

  const handleSubmit = async () => {
    if (mode === 'delete') {
      setSubmitLoading(true);
      try {
        await onSubmit(data);
        message.success(`${title} deleted successfully!`);
        onCancel();
      } catch (error) {
        message.error(`Failed to delete ${title.toLowerCase()}`);
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      
      const submitData = mode === 'edit' ? { ...data, ...values } : values;
      await onSubmit(submitData);
      
      message.success(`${title} ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      onCancel();
    } catch (error) {
      if (error.errorFields) {
        message.error('Please check the form fields');
      } else {
        message.error(`Failed to ${mode} ${title.toLowerCase()}`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const getModalTitle = () => {
    const action = mode?.charAt(0).toUpperCase() + mode?.slice(1);
    return `${action} ${title}`;
  };

  const renderFormField = (field) => {
    const { name, label, type = 'text', required = false, placeholder, options, rules = [] } = field;
    
    const defaultRules = required ? [{ required: true, message: `Please input ${label.toLowerCase()}!` }] : [];
    const fieldRules = [...defaultRules, ...rules];

    switch (type) {
      case 'textarea':
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Input.TextArea 
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              disabled={mode === 'view'}
              rows={4}
            />
          </Form.Item>
        );
      
      case 'select':
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Select 
              placeholder={placeholder || `Select ${label.toLowerCase()}`}
              disabled={mode === 'view'}
            >
              {options?.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      
      case 'number':
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Input 
              type="number"
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              disabled={mode === 'view'}
            />
          </Form.Item>
        );
      
      default:
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Input 
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              disabled={mode === 'view'}
            />
          </Form.Item>
        );
    }
  };

  const renderViewContent = () => {
    if (mode !== 'view') return null;

    const items = fields.map(field => ({
      key: field.name,
      label: field.label,
      children: data?.[field.name] || '-',
    }));

    return (
      <Descriptions column={1} bordered>
        {items.map(item => (
          <Descriptions.Item key={item.key} label={item.label}>
            {item.children}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  const renderDeleteContent = () => {
    if (mode !== 'delete') return null;

    return (
      <div>
        <p>Are you sure you want to delete this {title.toLowerCase()}?</p>
        {data && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {fields.slice(0, 3).map(field => (
              <p key={field.name} style={{ margin: '4px 0' }}>
                <strong>{field.label}:</strong> {data[field.name] || '-'}
              </p>
            ))}
          </div>
        )}
        <p style={{ color: '#ff4d4f', marginTop: '16px' }}>
          This action cannot be undone.
        </p>
      </div>
    );
  };

  const renderFooter = () => {
    if (mode === 'view') {
      return [
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ];
    }

    if (mode === 'delete') {
      return [
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={submitLoading}
          onClick={handleSubmit}
        >
          Delete
        </Button>
      ];
    }

    return [
      <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Button
        key="submit"
        type="primary"
        loading={submitLoading}
        onClick={handleSubmit}
      >
        {mode === 'create' ? 'Create' : 'Update'}
      </Button>
    ];
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onCancel}
      footer={renderFooter()}
      width={600}
      destroyOnClose
      confirmLoading={loading}
    >
      {mode === 'view' && renderViewContent()}
      {mode === 'delete' && renderDeleteContent()}
      {(mode === 'create' || mode === 'edit') && (
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          {fields.map(field => renderFormField(field))}
        </Form>
      )}
    </Modal>
  );
};

export default CrudModal;
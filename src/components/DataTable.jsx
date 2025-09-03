import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CrudModal from './CrudModal';

const DataTable = ({
  columns,
  data,
  loading = false,
  title = "Record",
  fields = [], // Field definitions for the modal
  onCreate,
  onUpdate,
  onDelete,
  showCreate = true,
  showView = true,
  showEdit = true,
  showDelete = true,
  tableProps = {},
  authUser
}) => {
  const [modalState, setModalState] = useState({
    visible: false,
    mode: null, // 'create', 'view', 'edit', 'delete'
    data: null
  });

  const [actionLoading, setActionLoading] = useState(false);

  const handleModalClose = () => {
    setModalState({
      visible: false,
      mode: null,
      data: null
    });
  };

  const handleCreate = () => {
    setModalState({
      visible: true,
      mode: 'create',
      data: null
    });
  };

  const handleView = (record) => {
    setModalState({
      visible: true,
      mode: 'view',
      data: record
    });
  };

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      data: record
    });
  };

  const handleDelete = (record) => {
    setModalState({
      visible: true,
      mode: 'delete',
      data: record
    });
  };

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      switch (modalState.mode) {
        case 'create':
          if (onCreate) await onCreate(formData);
          break;
        case 'edit':
          if (onUpdate) await onUpdate(formData);
          break;
        case 'delete':
          if (onDelete) await onDelete(modalState.data);
          break;
        default:
          break;
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Enhanced columns with actions
  const enhancedColumns = [
    ...columns,
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {showView && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              title="View"
            >
              View
            </Button>
          )}
          {showEdit && (
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              title="Edit"
            >
              Edit
            </Button>
          )}
          {showDelete && (
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
              placement="topRight"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                title="Delete"
                disabled={authUser?.username === record.username} // Prevent self-deletion
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Create Button */}
      {showCreate && (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add {title}
          </Button>
        </div>
      )}

      {/* Data Table */}
      <Table
        rowKey={(record) => record.id || record.key}
        columns={enhancedColumns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
        {...tableProps}
      />

      {/* CRUD Modal */}
      <CrudModal
        visible={modalState.visible}
        mode={modalState.mode}
        title={title}
        data={modalState.data}
        fields={fields}
        onCancel={handleModalClose}
        onSubmit={handleModalSubmit}
        loading={actionLoading}
        authUser={authUser}
      />
    </div>
  );
};

export default DataTable;
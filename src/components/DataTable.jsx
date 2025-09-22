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
  authUser,
  questionTypeOptions,
  // New pagination props
  pagination = null, // Pagination data from API response
  onPageChange, // Callback function for page changes
  onPageSizeChange, // Callback function for page size changes
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

  // Handle pagination change
  const handleTableChange = (paginationConfig) => {
    if (onPageChange && paginationConfig.current !== pagination?.current_page) {
      onPageChange(paginationConfig.current);
    }

    if (onPageSizeChange && paginationConfig.pageSize !== pagination?.per_page) {
      onPageSizeChange(paginationConfig.pageSize, paginationConfig.current);
    }
  };

  // Configure pagination based on API response
  const paginationConfig = pagination ? {
    current: pagination.current_page,
    total: pagination.total,
    pageSize: pagination.per_page,
    showSizeChanger: false,
    showQuickJumper: false,
    showTotal: (total, range) => {
      const from = pagination.from || range[0];
      const to = pagination.to || range[1];
      return `${from}-${to} of ${total} items`;
    },
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (page, pageSize) => {
      if (onPageChange) onPageChange(page);
    },
    onShowSizeChange: (current, size) => {
      if (onPageSizeChange) onPageSizeChange(size, 1); // Reset to first page when changing size
    }
  } : false;

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
                disabled={authUser?.username === record?.username} // Prevent self-deletion
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
    <>
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
        pagination={paginationConfig}
        onChange={handleTableChange}
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
        questionTypeOptions={questionTypeOptions}
      />
    </>
  );
};

export default DataTable;
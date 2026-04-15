import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import CrudModal from './CrudModal';

const DataTable = ({
  columns,
  data,
  loading = false,
  title = "Record",
  fields = [],
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
  // Server-side pagination (for most sections)
  pagination = null,
  onPageChange,
  onPageSizeChange,
  // Local pagination (for quiz-scores)
  localPagination = null,
  // Enable local search bar (for Students page)
  showSearch = false,
  onLockToggle = null,
}) => {
  const [modalState, setModalState] = useState({ visible: false, mode: null, data: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleModalClose = () => setModalState({ visible: false, mode: null, data: null });
  const handleCreate     = () => setModalState({ visible: true, mode: "create", data: null });
  const handleView       = (record) => setModalState({ visible: true, mode: "view",   data: record });
  const handleEdit       = (record) => setModalState({ visible: true, mode: "edit",   data: record });
  const handleDelete     = (record) => setModalState({ visible: true, mode: "delete", data: record });

  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    try {
      switch (modalState.mode) {
        case "create": if (onCreate) await onCreate(formData); break;
        case "edit":   if (onUpdate) await onUpdate(formData); break;
        case "delete": if (onDelete) await onDelete(modalState.data); break;
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ── Local search filter ────────────────────────────────────────────────────
  // Searches across all string/number values in each row recursively.
  // Only active when showSearch=true (Students page).
  const filteredData = useMemo(() => {
    if (!showSearch || !searchText.trim()) return data;
    const keyword = searchText.trim().toLowerCase();
    return data.filter(record =>
      Object.values(record).some(val => {
        if (val === null || val === undefined) return false;
        if (typeof val === "object") {
          // Search inside nested objects (e.g. student.nickname)
          return Object.values(val).some(v =>
            String(v ?? "").toLowerCase().includes(keyword)
          );
        }
        return String(val).toLowerCase().includes(keyword);
      })
    );
  }, [data, searchText, showSearch]);

  // ── Pagination config ──────────────────────────────────────────────────────
  let paginationConfig = false;

  if (localPagination) {
    paginationConfig = { ...localPagination, showQuickJumper: true };
  } else if (pagination) {
    paginationConfig = {
      current:         pagination.current_page,
      total:           pagination.total,
      pageSize:        pagination.per_page,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: (total, range) => {
        const from = pagination.from || range[0];
        const to   = pagination.to   || range[1];
        return `${from}-${to} of ${total} items`;
      },
      pageSizeOptions: ["10", "20", "50", "100"],
      onChange:        (page) => { if (onPageChange) onPageChange(page); },
      onShowSizeChange:(current, size) => { if (onPageSizeChange) onPageSizeChange(size, 1); },
    };
  }

  const handleTableChange = (paginationCfg) => {
    if (localPagination || showSearch) return;
    if (onPageChange && paginationCfg.current !== pagination?.current_page) {
      onPageChange(paginationCfg.current);
    }
    if (onPageSizeChange && paginationCfg.pageSize !== pagination?.per_page) {
      onPageSizeChange(paginationCfg.pageSize, paginationCfg.current);
    }
  };

  // Enhanced columns with action buttons
  const enhancedColumns = [
    ...columns,
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {showView && (
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>View</Button>
          )}
          {showEdit && (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          )}
          {onLockToggle && (
            <Button
              size="small"
              onClick={() => onLockToggle(record, !record.is_locked)}
              style={{
                background: record.is_locked ? '#E8F5E9' : '#FFEBEE',
                color:      record.is_locked ? '#2E7D32' : '#C62828',
                border:     `1px solid ${record.is_locked ? '#A5D6A7' : '#EF9A9A'}`,
                borderRadius: 8,
              }}
            >
              {record.is_locked ? '🔓 Unlock' : '🔒 Lock'}
            </Button>
          )}
          {showDelete && (
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(record)}
              okText="Yes" cancelText="No" placement="topRight"
            >
              <Button size="small" danger icon={<DeleteOutlined />} disabled={authUser?.username === record?.username}>
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
      {/* Top bar: Search (left) + Add button (right) */}
      {(showCreate || showSearch) && (
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {showSearch ? (
            <Input
              placeholder={`Search ${title}...`}
              prefix={<SearchOutlined style={{ color: "#bbb" }} />}
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ maxWidth: 320, borderRadius: 8 }}
            />
          ) : <div />}

          {showCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add {title}
            </Button>
          )}
        </div>
      )}

      {/* Show result count when searching */}
      {showSearch && searchText.trim() && (
        <div style={{ marginBottom: 8, fontSize: 13, color: "#888" }}>
          Found <strong style={{ color: "#1890ff" }}>{filteredData.length}</strong> result{filteredData.length !== 1 ? "s" : ""} for "<strong>{searchText}</strong>"
        </div>
      )}

      <Table
        rowKey={(record) => record.id || record.key}
        columns={enhancedColumns}
        dataSource={filteredData}
        loading={loading}
        pagination={paginationConfig}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        size="middle"
        {...tableProps}
      />

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
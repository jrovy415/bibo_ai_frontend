import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useApi } from '../composables/useApi';
import DataTable from './components/DataTable';
import axios from '../plugins/axios';

const QuestionTypes = () => {
    const { store, update, destroy } = useApi('/question-types');

    // Local state for pagination
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState(null);

    // Fetch data with pagination
    const fetchData = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const response = await axios.get(`/question-types?page=${page}&per_page=${size}`);

            if (response.data.data) {
                const responseData = response.data.data;

                // Handle paginated response
                if (responseData.data && Array.isArray(responseData.data)) {
                    setItems(responseData.data);
                    setPagination({
                        current_page: responseData.current_page,
                        total: responseData.total,
                        per_page: responseData.per_page,
                        from: responseData.from,
                        to: responseData.to,
                        last_page: responseData.last_page
                    });
                }
                // Handle direct array response (for non-paginated endpoints)
                else if (Array.isArray(responseData)) {
                    setItems(responseData);
                    setPagination(null);
                }
                // Handle single object response
                else {
                    setItems([responseData]);
                    setPagination(null);
                }
            } else {
                setItems([]);
                setPagination(null);
            }
        } catch (error) {
            console.error('Failed to fetch question types:', error);
            setItems([]);
            setPagination(null);
            message.error('Failed to fetch question types');
        } finally {
            setLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle page size change
    const handlePageSizeChange = (size, page = 1) => {
        setPageSize(size);
        setCurrentPage(page);
    };

    // Fetch data when page or pageSize changes
    useEffect(() => {
        fetchData(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handleCreate = async (formData) => {
        try {
            await store(formData);
            // Refresh current page after creation
            await fetchData(currentPage, pageSize);
            message.success('Question type created successfully');
        } catch (error) {
            console.error('Create error:', error);
            message.error('Failed to create question type');
            throw error;
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await update(formData.id, formData);
            // Refresh current page after update
            await fetchData(currentPage, pageSize);
            message.success('Question type updated successfully');
        } catch (error) {
            console.error('Update error:', error);
            message.error('Failed to update question type');
            throw error;
        }
    };

    const handleDelete = async (record) => {
        try {
            await destroy(record.id);

            // Calculate if we need to go to previous page after deletion
            const newTotal = pagination ? pagination.total - 1 : items.length - 1;
            const maxPage = Math.ceil(newTotal / pageSize);
            const targetPage = currentPage > maxPage ? maxPage : currentPage;

            // Refresh appropriate page after deletion
            await fetchData(targetPage || 1, pageSize);

            // Update current page if necessary
            if (targetPage !== currentPage) {
                setCurrentPage(targetPage || 1);
            }

            message.success('Question type deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Failed to delete question type');
            throw error;
        }
    };

    const columns = [
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
        }
    ];

    const fields = [
        {
            name: 'label',
            label: 'Label',
            required: true,
            type: 'text'
        }
    ];

    return (
        <DataTable
            title="Question Type"
            data={items}
            loading={loading}
            columns={columns}
            fields={fields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            showEdit={true}
            showDelete={true}
            showView={true}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
        />
    );
};

export default QuestionTypes;
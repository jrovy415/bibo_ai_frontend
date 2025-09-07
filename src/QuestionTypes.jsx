import React, { useEffect } from 'react';
import { message } from 'antd';
import { useApi } from '../composables/useApi';
import DataTable from './components/DataTable';

const QuestionTypes = () => {
    const { items, loading, index, store, update, destroy } = useApi('/question-types');

    useEffect(() => {
        index();
    }, []);

    const handleCreateOrUpdate = async (formData, mode) => {
        try {
            if (mode === 'create') {
                await store(formData);
                message.success('Question type created!');
            } else if (mode === 'edit') {
                await update(formData.id, formData);
                message.success('Question type updated!');
            }
            await index();
        } catch (error) {
            console.error(error);
            message.error('Failed to save');
        }
    };

    const handleDelete = async (record) => {
        try {
            await destroy(record.id);
            message.success('Deleted successfully');
            await index();
        } catch (error) {
            console.error(error);
            message.error('Failed to delete');
        }
    };

    const columns = [
        { title: 'Label', dataIndex: 'label', key: 'label' },
    ];

    return (
        <DataTable
            title="Question Type"
            data={items}
            loading={loading}
            columns={columns}
            fields={[{ name: 'label', label: 'Label', required: true }]}
            onCreate={(data) => handleCreateOrUpdate(data, 'create')}
            onUpdate={(data) => handleCreateOrUpdate(data, 'edit')}
            onDelete={handleDelete}
            showEdit={false}
            showDelete={false}
        />
    );
};

export default QuestionTypes;

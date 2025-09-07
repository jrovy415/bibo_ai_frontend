import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Descriptions, message, Select, Card, Divider, Checkbox, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';

const CrudModal = ({
  visible,
  onCancel,
  mode, // 'create', 'view', 'edit', 'delete'
  title,
  data,
  fields,
  onSubmit,
  loading = false,
  authUser,
  questionTypeOptions = [],
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      const formData = data || {};
      form.setFieldsValue(formData);
      if (title === 'Quiz' && data?.questions) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
    } else if (mode === 'create') {
      form.resetFields();
      setQuestions([]);
    }
  }, [data, mode, form, title]);

  const formatDisplayValue = (value, record, fieldName) => {
    if (!fieldName) return value ?? '-';

    const path = Array.isArray(fieldName) ? fieldName : fieldName.split('.');
    const resolved = path.reduce((acc, key) => (acc ? acc[key] : undefined), record);

    if (resolved === null || resolved === undefined || resolved === '') return '-';
    if (typeof resolved === 'object' && resolved.label) return resolved.label;
    return String(resolved);
  };


  const handleSubmit = async () => {
    if (mode === 'delete') {
      setSubmitLoading(true);
      try {
        await onSubmit(data);
        message.success(`${title} deleted successfully!`);
        onCancel();
      } catch (error) {
        message.error(`Failed to delete ${title.toLowerCase()}`);

        console.error(error)
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      const submitData = mode === 'edit' ? { ...data, ...values } : values;

      if (title === 'Quiz') submitData.questions = questions;

      await onSubmit(submitData);

      message.success(`${title} ${mode === 'create' ? 'created' : 'updated'} successfully!`);

      onCancel();
    } catch (error) {
      message.error('Please check the form fields');

      console.error(error)
    } finally {
      setSubmitLoading(false);
    }
  };

  const getModalTitle = () => `${mode?.charAt(0).toUpperCase() + mode?.slice(1)} ${title}`;

  // --- Question & Choice management ---
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        question_text: '',
        question_type: questionTypeOptions[0]?.value || 'multiple_choice',
        points: 1,
        choices: [
          { id: Date.now() + 1, choice_text: '', is_correct: false },
          { id: Date.now() + 2, choice_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];

    newQuestions[index][field] = value;

    setQuestions(newQuestions);
  };

  const addChoice = (questionIndex) => {
    const newQuestions = [...questions];

    newQuestions[questionIndex].choices.push({
      id: Date.now(),
      choice_text: '',
      is_correct: false,
    });

    setQuestions(newQuestions);
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    const newQuestions = [...questions];

    newQuestions[questionIndex].choices = newQuestions[questionIndex].choices.filter((_, i) => i !== choiceIndex);

    setQuestions(newQuestions);
  };

  const updateChoice = (questionIndex, choiceIndex, field, value) => {
    const newQuestions = [...questions];

    if (field === 'is_correct' && value) {
      newQuestions[questionIndex].choices.forEach((c, idx) => {
        if (idx !== choiceIndex) c.is_correct = false;
      });
    }

    newQuestions[questionIndex].choices[choiceIndex][field] = value;

    setQuestions(newQuestions);
  };

  const renderQuestionField = (question, questionIndex) => {
    const isDisabled = mode === 'view';
    const selectedTypeFromOptions = questionTypeOptions?.find(opt => opt.value === question.question_type_id);

    let selectedTypeName;
    if (selectedTypeFromOptions) {
      // Convert label to name format (you might need to adjust this mapping)
      const labelToName = {
        'Multiple Choice': 'multiple_choice',
        'True/False': 'true_false',
        'Reading': 'reading'
      };
      selectedTypeName = labelToName[selectedTypeFromOptions.label];
    } else {
      selectedTypeName = question.question_type?.name;
    }

    const isMultipleChoice = selectedTypeName === 'multiple_choice';
    const isTrueFalse = selectedTypeName === 'true_false';

    return (
      <Card
        key={questionIndex}
        size="small"
        title={`Question ${questionIndex + 1}`}
        style={{ marginBottom: 16 }}
        extra={!isDisabled && (
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeQuestion(questionIndex)}>
            Remove
          </Button>
        )}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>Question Text:</label>
            <Input.TextArea
              value={question.question_text}
              onChange={(e) => updateQuestion(questionIndex, 'question_text', e.target.value)}
              placeholder="Enter your question"
              disabled={isDisabled}
              rows={2}
            />
          </div>

          <div>
            <label>Question Type:</label>
            <Select
              value={question.question_type_id}
              onChange={(value) => {
                const selected = questionTypeOptions.find(opt => opt.value === value);
                updateQuestion(questionIndex, 'question_type_id', value);

                const labelToName = {
                  'Multiple Choice': 'multiple_choice',
                  'True/False': 'true_false',
                  'Reading': 'reading'
                };
                const selectedName = labelToName[selected?.label];

                if (selectedName === 'true_false') {
                  // Automatically add True and False choices for true/false questions
                  updateQuestion(questionIndex, 'choices', [
                    { choice_text: 'True', is_correct: false },
                    { choice_text: 'False', is_correct: false }
                  ]);
                } else {
                  // Clear choices when changing to any other question type
                  updateQuestion(questionIndex, 'choices', []);
                }
              }}
              disabled={isDisabled}
              style={{ width: '100%' }}
              options={(questionTypeOptions || []).map((d) => ({
                value: d.value,
                label: d.label,
              }))}
            />
          </div>

          <div>
            <label>Points:</label>
            <InputNumber
              value={question.points}
              onChange={(value) => updateQuestion(questionIndex, 'points', value)}
              min={1}
              disabled={isDisabled}
              style={{ width: '100%' }}
            />
          </div>

          {(isMultipleChoice || isTrueFalse) && question.choices?.length > 0 && (
            <Divider orientation="left">Answer Choices</Divider>
          )}

          {(isMultipleChoice || isTrueFalse) &&
            question.choices?.map((choice, choiceIndex) => (
              <div key={`choice-${questionIndex}-${choiceIndex}-${choice.id || choiceIndex}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Checkbox
                  checked={choice.is_correct}
                  onChange={(e) => updateChoice(questionIndex, choiceIndex, 'is_correct', e.target.checked)}
                  disabled={isDisabled}
                />
                <Input
                  value={choice.choice_text}
                  onChange={(e) => updateChoice(questionIndex, choiceIndex, 'choice_text', e.target.value)}
                  placeholder={`Choice ${choiceIndex + 1}`}
                  disabled={isDisabled || isTrueFalse} // Disable editing for true/false choices
                  style={{ flex: 1 }}
                />
                {!isDisabled && !isTrueFalse && ( // Hide remove button for true/false choices
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeChoice(questionIndex, choiceIndex)}
                  />
                )}
              </div>
            ))
          }

          {isMultipleChoice && !isDisabled && (
            <Button type="dashed" onClick={() => addChoice(questionIndex)} style={{ width: '100%' }} icon={<PlusOutlined />}>
              Add Choice
            </Button>
          )}
        </Space>
      </Card>
    );
  };

  const renderFormField = (field) => {
    const { name, label, type = 'text', required = false, placeholder, options, rules = [] } = field;
    const fieldRules = required ? [{ required: true, message: `Please input ${label.toLowerCase()}!` }, ...rules] : rules;

    switch (type) {
      case 'textarea':
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Input.TextArea placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled={mode === 'view'} rows={4} />
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Select placeholder={placeholder || `Select ${label.toLowerCase()}`} disabled={mode === 'view'}>
              {options?.map(opt =>
                typeof opt === 'string' ? (
                  <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                ) : (
                  <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                )
              )}
            </Select>
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Input type="number" placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled={mode === 'view'} />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item key={name} name={name} valuePropName="checked" label={label} rules={fieldRules}>
            <Input type="checkbox" disabled={mode === 'view'} />
          </Form.Item>
        );
      default:
        return (
          <Form.Item key={name} name={name} label={label} rules={fieldRules}>
            <Input placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled={mode === 'view'} />
          </Form.Item>
        );
    }
  };

  const renderViewContent = () => {
    if (mode !== 'view') return null;

    const visibleFields = fields.filter(f => f.type !== 'hidden');
    return (
      <div>
        <Descriptions column={1} bordered>
          {visibleFields.map(f => (
            <Descriptions.Item key={f.name} label={f.label}>
              {formatDisplayValue(data?.[f.name], data, f.name)}
            </Descriptions.Item>
          ))}
        </Descriptions>

        {title === 'Quiz' && questions.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Divider orientation="left">Questions</Divider>
            {questions.map((q, idx) => renderQuestionField(q, idx))}
          </div>
        )}
      </div>
    );
  };

  const renderDeleteContent = () => {
    if (mode !== 'delete') return null;
    return (
      <div>
        <p>Are you sure you want to delete this {title.toLowerCase()}?</p>
        {data && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            {fields.slice(0, 3).map(f => (
              <p key={f.name}><strong>{f.label}:</strong> {formatDisplayValue(data[f.name])}</p>
            ))}
          </div>
        )}
        <p style={{ color: '#ff4d4f', marginTop: 16 }}>This action cannot be undone.</p>
      </div>
    );
  };

  const renderFooter = () => {
    if (mode === 'view') return [<Button key="close" onClick={onCancel}>Close</Button>];
    if (mode === 'delete') return [
      <Button key="cancel" onClick={onCancel}>Cancel</Button>,
      <Button key="delete" type="primary" danger loading={submitLoading} onClick={handleSubmit}>Delete</Button>
    ];
    return [
      <Button key="cancel" onClick={onCancel}>Cancel</Button>,
      <Button key="submit" type="primary" loading={submitLoading} onClick={handleSubmit}>
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
      width={1200}
      confirmLoading={loading}
      style={{ top: 20, maxHeight: '70vh', overflowY: 'auto' }}
      maskClosable={false}

    >
      {mode === 'view' && renderViewContent()}
      {mode === 'delete' && renderDeleteContent()}
      {(mode === 'create' || mode === 'edit') && (
        <Form
          key={mode + (data?.id || '')}
          form={form}
          layout="vertical"
          initialValues={mode === 'edit' || mode === 'view' ? data : {}}
          preserve={false}
        >
          {fields.map(f => renderFormField(f))}

          {title === 'Quiz' && (
            <div style={{ marginTop: 24 }}>
              <Divider orientation="left">Questions</Divider>
              {questions.map((q, idx) => renderQuestionField(q, idx))}
              {mode !== 'view' && (
                <Button type="dashed" onClick={addQuestion} style={{ width: '100%', marginTop: 16 }} icon={<PlusOutlined />}>
                  Add Question
                </Button>
              )}
            </div>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default CrudModal;

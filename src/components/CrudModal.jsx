import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Descriptions, message, Select, Card, Divider, Checkbox, InputNumber, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios, { nonApi } from '../../plugins/axios';

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
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      const formData = data || {};
      form.setFieldsValue(formData);
      if (title === 'Quiz' && data?.questions) {
        setQuestions(data.questions);

        const existingFiles = data.questions.map((q, i) => {
          if (q.photo) {
            return {
              uid: `question-${i}`,
              name: q.photo.split("/").pop(),
              status: "done",
              url: q.photo.startsWith("http")
                ? q.photo
                : `${nonApi}/${q.photo}`, // 👈 nonApi here
            };
          }
          return null;
        }).filter(Boolean);

        setFileList(existingFiles);
      } else {
        setQuestions([]);
      }
    } else if (mode === 'create') {
      form.resetFields();
      setQuestions([]);
    }
  }, [data, mode, form, title]);

  const handleCustomRequest = async (options, questionIndex) => {
    const { file, onSuccess, onError, onProgress } = options;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      // simulate progress
      if (onProgress) {
        onProgress({ percent: 30 });
      }

      const res = await axios.post(
        `/quizzes/${data?.id}/questions/upload-photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (onProgress) {
        onProgress({ percent: 100 });
      }

      const uploaded = res.data?.data; // { filename, url }

      // ✅ Update questions state
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          photo: uploaded.filename,
        };
        return updated;
      });

      // ✅ Update fileList for Upload
      setFileList(prev => [
        ...prev.filter(f => f.uid !== `question-${questionIndex}`),
        {
          uid: `question-${questionIndex}`, // unique per question
          name: file.name,
          status: "done", // 👈 must be "done"
          url: uploaded.url, // 👈 previewable URL from backend
        },
      ]);


      // ✅ tell AntD upload finished
      onSuccess({ url: uploaded.url }, file);
    } catch (err) {
      console.error(err);
      onError?.(err);
    }
  };

  const formatDisplayValue = (value, record, fieldName) => {
    if (!fieldName) return value ?? '-';

    const path = Array.isArray(fieldName) ? fieldName : fieldName.split('.');
    const resolved = path.reduce((acc, key) => (acc ? acc[key] : undefined), record);

    if (resolved === null || resolved === undefined || resolved === '') return '-';
    if (typeof resolved === 'object' && resolved.label) return resolved.label;
    return String(resolved);
  };

  const handleSubmit = async () => {
    console.log('=== HandleSubmit Debug Info ===');
    console.log('Mode:', mode);
    console.log('Title:', title);
    console.log('Original data:', data);

    if (mode === 'delete') {
      setSubmitLoading(true);
      try {
        await onSubmit(data);
        onCancel();
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    try {
      setSubmitLoading(true);

      // Validate visible form fields
      const visibleFields = fields.filter(f => f.type !== 'hidden');
      const fieldsToValidate = visibleFields.map(f => f.name);

      let values = {};
      try {
        values = await form.validateFields(fieldsToValidate);
        console.log('Form validation passed. Values:', values);
      } catch (formError) {
        setSubmitLoading(false);
        message.error('Please fill in all required fields correctly');
        console.error('Form validation failed:', formError);
        return;
      }

      // Include hidden field values
      const hiddenFields = fields.filter(f => f.type === 'hidden');
      hiddenFields.forEach(f => {
        const formValue = form.getFieldValue(f.name);
        const originalValue = data?.[f.name];
        values[f.name] = formValue !== undefined ? formValue : originalValue;
      });

      // Quiz-specific validation
      if (title === 'Quiz') {
        if (questions.length === 0) {
          setSubmitLoading(false);
          message.error('Please add at least one question');
          return;
        }

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.question_text?.trim()) {
            setSubmitLoading(false);
            message.error(`Please enter text for Question ${i + 1}`);
            return;
          }
          if (!q.question_type_id) {
            setSubmitLoading(false);
            message.error(`Please select question type for Question ${i + 1}`);
            return;
          }
          if (!q.points || q.points < 1) {
            setSubmitLoading(false);
            message.error(`Please set valid points for Question ${i + 1}`);
            return;
          }

          const typeLabel = questionTypeOptions?.find(opt => opt.value === q.question_type_id)?.label;
          if (['Multiple Choice', 'True/False'].includes(typeLabel)) {
            if (!q.choices || q.choices.length === 0) {
              setSubmitLoading(false);
              message.error(`Please add choices for Question ${i + 1}`);
              return;
            }
            if (!q.choices.some(c => c.is_correct)) {
              setSubmitLoading(false);
              message.error(`Please mark the correct answer for Question ${i + 1}`);
              return;
            }
            if (q.choices.some(c => !c.choice_text?.trim())) {
              setSubmitLoading(false);
              message.error(`Please enter text for all choices in Question ${i + 1}`);
              return;
            }
          }
        }
      }

      // Merge values with existing data for edit mode
      let submitData = mode === 'edit' ? { ...data, ...values } : values;
      if (!submitData.id && data?.id) submitData.id = data.id;

      // Handle Quiz submissions
      if (title === 'Quiz') {
        const hasFileUploads = questions.some(q => q.photo instanceof File);

        if (hasFileUploads) {
          const formData = new FormData();

          if (mode === 'edit' && submitData.id) formData.append('id', submitData.id);

          // Add other fields except questions
          Object.keys(submitData).forEach(key => {
            if (key !== 'questions') {
              if (typeof submitData[key] === 'object' && submitData[key] !== null) {
                formData.append(key, JSON.stringify(submitData[key]));
              } else {
                formData.append(key, submitData[key]);
              }
            }
          });

          // Add questions
          // Add questions using Laravel array notation
          questions.forEach((question, questionIndex) => {
            formData.append(`questions[${questionIndex}][question_text]`, question.question_text || '');
            formData.append(`questions[${questionIndex}][question_type_id]`, question.question_type_id || '');
            formData.append(`questions[${questionIndex}][points]`, question.points || 1);
            if (question.id) formData.append(`questions[${questionIndex}][id]`, question.id);

            // In the handleSubmit function, update the FormData handling:
            if (question.photo) {
              formData.append(`questions[${questionIndex}][photo]`, question.photo);
            }

            // Add choices
            question.choices?.forEach((choice, choiceIndex) => {
              formData.append(`questions[${questionIndex}][choices][${choiceIndex}][choice_text]`, choice.choice_text || '');
              formData.append(`questions[${questionIndex}][choices][${choiceIndex}][is_correct]`, choice.is_correct ? '1' : '0');
              if (choice.id) formData.append(`questions[${questionIndex}][choices][${choiceIndex}][id]`, choice.id);
            });
          });

          console.log('Submitting FormData with files');
          await onSubmit(formData);

        } else {
          // No files, send JSON (include string paths)
          submitData.questions = questions;
          await onSubmit(submitData);
        }
      } else {
        await onSubmit(submitData);
      }

      onCancel();

    } catch (error) {
      console.error('Submit error:', error);
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
    const readingQuestionTypeOptions = (questionTypeOptions || []).filter(opt => opt.label === 'Reading');


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
          <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => removeQuestion(questionIndex)}>
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

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Photo (optional):</label>
            <Upload
              disabled={isDisabled}
              name="photo"
              customRequest={(options) => handleCustomRequest(options, questionIndex)}
              accept="image/*"
              fileList={fileList.filter(f => f.uid === `question-${questionIndex}`)}
              onChange={({ fileList: newFileList }) =>
                setFileList([
                  ...fileList.filter(f => !f.uid.startsWith(`question-${questionIndex}`)),
                  ...newFileList.map(f => ({ ...f, uid: `question-${questionIndex}` })),
                ])
              }
              onRemove={async (file) => {
                try {
                  await axios.delete(`/quizzes/${data?.id}/questions/delete-photo`, {
                    data: { filename: questions[questionIndex].photo },
                  });

                  // Clear file from UI state
                  setFileList(prev =>
                    prev.filter(f => f.uid !== `question-${questionIndex}`)
                  );

                  // Clear photo reference in question state
                  const newQuestions = [...questions];
                  newQuestions[questionIndex] = {
                    ...newQuestions[questionIndex],
                    photo: null,
                  };
                  setQuestions(newQuestions);

                } catch (err) {
                  console.error(err);
                }
              }}
              listType="picture-card"
              maxCount={1}
            >
              {fileList.some(f => f.uid === `question-${questionIndex}`) ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </div>

          <div>
            <label>Question Type:</label>
            <Select
              value={question?.question_type_id}
              onChange={(value) => {
                updateQuestion(questionIndex, 'question_type_id', value);
                // For Reading, clear choices
                updateQuestion(questionIndex, 'choices', []);
              }}
              disabled={isDisabled}
              style={{ width: '100%' }}
              options={readingQuestionTypeOptions.map(d => ({
                value: d.value,
                label: d.label,
              }))}
            />
            {/* <Select
              value={question?.question_type_id}
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
            /> */}
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
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 18 }}>{getModalTitle()}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={renderFooter()}
      width={1000}
      confirmLoading={loading}
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
        padding: "20px 24px",
        background: "#fafafa",
        borderRadius: 8,
      }}
      maskClosable={false}
      centered
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

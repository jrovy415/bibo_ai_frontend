import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Descriptions, message, Select, Card, Divider, Checkbox, InputNumber, Upload, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined, UploadOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import axios, { nonApi } from '../../plugins/axios';

const QUIZ_STEPS = [
  { key: 'info',      label: 'Quiz Info',   emoji: '📋' },
  { key: 'material',  label: 'Material',    emoji: '📚' },
  { key: 'questions', label: 'Questions',   emoji: '❓' },
  { key: 'review',    label: 'Review',      emoji: '✅' },
];

const DIFFICULTY_COLORS = {
  Introduction:   { bg: '#E1F5EE', text: '#0F6E56', border: '#5DCAA5' },
  Easy:           { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459' },
  EasyPostTest:   { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459' },
  Medium:         { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27' },
  MediumPostTest: { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27' },
  Hard:           { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
  HardPostTest:   { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
  Expert:         { bg: '#EDE8FB', text: '#4B3BAD', border: '#A594F9' },
  ExpertPostTest: { bg: '#EDE8FB', text: '#4B3BAD', border: '#A594F9' },
  PostTest:       { bg: '#FEE9F5', text: '#9C1F6B', border: '#F09CD6' },
};

const StepBar = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
    {QUIZ_STEPS.map((step, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={step.key}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: done ? '#1D9E75' : active ? '#7F77DD' : (document.body.getAttribute('data-dark')==='1'?'#2D2A50':'#f0f0f0'),
              border: `2px solid ${done ? '#1D9E75' : active ? '#7F77DD' : (document.body.getAttribute('data-dark')==='1'?'#3D3A6B':'#d9d9d9')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: done ? 16 : 18, transition: 'all 0.25s',
              color: done || active ? '#fff' : '#bbb', fontWeight: 600,
            }}>
              {done ? '✓' : step.emoji}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#7F77DD' : done ? '#1D9E75' : (document.body.getAttribute('data-dark')==='1'?'#4A4870':'#aaa'), whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
          {i < QUIZ_STEPS.length - 1 && (
            <div style={{ width: 48, height: 2, marginBottom: 18, background: done ? '#1D9E75' : '#e8e8e8', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const FieldLabel = ({ children, required, hint }) => {
  const dark = document.body.getAttribute('data-dark') === '1';
  return (
  <div style={{ fontSize: 12, fontWeight: 600, color: dark ? '#A09FD0' : '#555', marginBottom: 5, display: 'flex', gap: 4, alignItems: 'baseline' }}>
    <span>{children}{required && <span style={{ color: '#e74c3c', marginLeft: 2 }}>*</span>}</span>
    {hint && <span style={{ fontWeight: 400, color: document.body.getAttribute('data-dark')==='1'?'#6B6A90':'#aaa', fontSize: 11 }}>{hint}</span>}
  </div>
  );
};

const WizardInput = (props) => {
  const dark = document.body.getAttribute('data-dark') === '1';
  return (
    <input {...props} style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: `1px solid ${dark ? '#3D3A6B' : '#e0e0e0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: dark ? '#221F3D' : '#fff', color: dark ? '#D0CFEE' : '#222', transition: 'border-color 0.2s', ...(props.style || {}) }}
      onFocus={e => e.target.style.borderColor = '#7F77DD'}
      onBlur={e => e.target.style.borderColor = dark ? '#3D3A6B' : '#e0e0e0'}
    />
  );
};

const WizardTextarea = (props) => {
  const dark = document.body.getAttribute('data-dark') === '1';
  return (
    <textarea {...props} style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: `1px solid ${dark ? '#3D3A6B' : '#e0e0e0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 72, background: dark ? '#221F3D' : '#fff', color: dark ? '#D0CFEE' : '#222', ...(props.style || {}) }}
      onFocus={e => e.target.style.borderColor = '#7F77DD'}
      onBlur={e => e.target.style.borderColor = dark ? '#3D3A6B' : '#e0e0e0'}
    />
  );
};

const WizardSelect = ({ value, onChange, options, placeholder, disabled }) => {
  const dark = document.body.getAttribute('data-dark') === '1';
  return (
    <select value={value || ''} onChange={onChange} disabled={disabled} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${dark ? '#3D3A6B' : '#e0e0e0'}`, fontSize: 14, background: dark ? '#221F3D' : '#fff', color: value ? (dark ? '#D0CFEE' : '#222') : '#aaa', outline: 'none', fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
};

const ScoringInfo = () => (
  <div style={{
    fontSize: 11, color: '#0F6E56', lineHeight: 1.6,
    background: '#f0faf5', borderRadius: 6, padding: '7px 10px',
    border: '1px solid #b2e8d0', marginTop: 6,
  }}>
    <strong>🔤 Word-by-Word Scoring:</strong> Student earns partial points per correct word spoken. Example: saying 3 out of 5 words correctly = 3 pts out of 5.
  </div>
);

// ── Step 1 — Quiz Info ────────────────────────────────────────────────────────
const DIFFICULTY_TITLES = {
  Introduction:   'Pre-Test',
  Easy:           'Low Reader - Activity',
  EasyPostTest:   'Low Reader Post-Test',
  Medium:         'Beginning Reader - Activity',
  MediumPostTest: 'Beginning Reader Post-Test',
  Hard:           'Developing Reader - Activity',
  HardPostTest:   'Developing Reader Post-Test',
  Expert:         'Grade Ready Reader - Activity',
  ExpertPostTest: 'Grade Ready Reader Post-Test',
};

const DEFAULT_INSTRUCTIONS = 'Read each sentence aloud using your microphone.';

const StepInfo = ({ form, onChange, disabled }) => {
  const difficulties = [
    { value: 'Introduction',    label: 'Pre-Test',                    group: null },
    { value: 'Easy',            label: 'Low Reader',                  group: 'Low Reader' },
    { value: 'EasyPostTest',    label: 'Low Reader Post-Test',        group: 'Low Reader' },
    { value: 'Medium',          label: 'Beginning Reader',            group: 'Beginning Reader' },
    { value: 'MediumPostTest',  label: 'Beginning Reader Post-Test',  group: 'Beginning Reader' },
    { value: 'Hard',            label: 'Developing Reader',           group: 'Developing Reader' },
    { value: 'HardPostTest',    label: 'Developing Reader Post-Test', group: 'Developing Reader' },
    { value: 'Expert',          label: 'Grade Ready Reader',          group: 'Grade Ready Reader' },
    { value: 'ExpertPostTest',  label: 'Grade Ready Post-Test',       group: 'Grade Ready Reader' },
  ];
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div>
        <FieldLabel required>Quiz title</FieldLabel>
        <WizardInput value={form.title || ''} onChange={e => onChange('title', e.target.value)} placeholder="e.g. Counting 1 to 10" disabled={disabled} />
      </div>
      <div>
        <FieldLabel hint="(auto-filled)">Instructions for students</FieldLabel>
        <WizardTextarea value={form.instructions || ''} onChange={e => onChange('instructions', e.target.value)} placeholder="Read each sentence aloud using your microphone." disabled={disabled} rows={3} />
        {!form.instructions && !disabled && (
          <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>
            💡 Will auto-fill when you pick a difficulty
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <FieldLabel required>Grade level</FieldLabel>
          <WizardSelect value={form.grade_level} onChange={e => {
            const grade = e.target.value;
            onChange('grade_level', grade);
            if (form.difficulty && DIFFICULTY_TITLES[form.difficulty]) {
              onChange('title', `${grade} ${DIFFICULTY_TITLES[form.difficulty]}`);
            }
            if (!form.instructions) onChange('instructions', DEFAULT_INSTRUCTIONS);
          }} options={[{ value: 'Kinder', label: 'Kinder' }, { value: 'Grade 1', label: 'Grade 1' }]} placeholder="Pick grade…" disabled={disabled} />
        </div>
        <div>
          <FieldLabel required>Difficulty</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {difficulties.filter(d => !d.group).map(({ value, label }) => {
              const c = DIFFICULTY_COLORS[value] || { bg:'#E1F5EE', text:'#0F6E56', border:'#5DCAA5' };
              const active = form.difficulty === value;
              return (
                <button key={value} disabled={disabled} onClick={() => {
                  if (disabled) return;
                  onChange('difficulty', value);
                  if (DIFFICULTY_TITLES[value]) {
                    const grade = form.grade_level || '';
                    onChange('title', grade ? `${grade} ${DIFFICULTY_TITLES[value]}` : DIFFICULTY_TITLES[value]);
                  }
                  if (!form.instructions) onChange('instructions', DEFAULT_INSTRUCTIONS);
                }}
                  style={{ padding:'7px 8px', borderRadius:8, fontSize:12, fontWeight:600, cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', background:active?c.bg:'#fafafa', color:active?c.text:'#bbb', border:`1.5px solid ${active?c.border:'#e8e8e8'}`, transition:'all 0.15s', textAlign:'left' }}>
                  📝 {label}
                </button>
              );
            })}
            {['Low Reader','Beginning Reader','Developing Reader','Grade Ready Reader'].map(group => {
              const pair = difficulties.filter(d => d.group === group);
              return (
                <div key={group} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                  {pair.map(({ value, label }) => {
                    const c = DIFFICULTY_COLORS[value] || DIFFICULTY_COLORS[value.replace('PostTest','')] || { bg:'#f0f0f0', text:'#888', border:'#ddd' };
                    const active = form.difficulty === value;
                    const isPost = value.includes('PostTest');
                    return (
                      <button key={value} disabled={disabled} onClick={() => {
                        if (disabled) return;
                        onChange('difficulty', value);
                        if (DIFFICULTY_TITLES[value]) {
                          const grade = form.grade_level || '';
                          onChange('title', grade ? `${grade} ${DIFFICULTY_TITLES[value]}` : DIFFICULTY_TITLES[value]);
                        }
                        if (!form.instructions) onChange('instructions', DEFAULT_INSTRUCTIONS);
                      }}
                        style={{ padding:'6px 4px', borderRadius:8, fontSize:11, fontWeight:600, cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', background:active?c.bg:'#fafafa', color:active?c.text:'#bbb', border:`1.5px solid ${active?c.border:'#e8e8e8'}`, transition:'all 0.15s', opacity:isPost?0.85:1 }}>
                        {isPost ? '📋' : '📖'} {label}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 180 }}>
        <FieldLabel>Time limit (minutes)</FieldLabel>
        <WizardInput type="number" min={1} max={120} value={form.time_limit || ''} onChange={e => onChange('time_limit', e.target.value)} placeholder="e.g. 30" disabled={disabled} />
      </div>
      <div>
        <FieldLabel>Active</FieldLabel>
        <Switch checked={!!form.is_active} onChange={v => onChange('is_active', v)} disabled={disabled} />
        <span style={{ marginLeft: 8, fontSize: 13, color: document.body.getAttribute('data-dark')==='1'?'#7A79A0':'#888' }}>{form.is_active ? 'Visible to students' : 'Hidden from students'}</span>
      </div>
    </div>
  );
};

// ── Step 2 — Material ─────────────────────────────────────────────────────────
const StepMaterial = ({ material, onChange, disabled }) => (
  <div style={{ display: 'grid', gap: 14 }}>
    <div style={{ background: document.body.getAttribute('data-dark')==='1'?'#221F3D':'#f8f6ff', borderRadius: 10, padding: '12px 14px', border: '1px solid #e8e4f8', fontSize: 13, color: '#7F77DD' }}>
      Optional — add a story, YouTube video, or link for students to read/watch before answering.
    </div>
    <div>
      <FieldLabel>Type</FieldLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ value: 'story', label: '📖 Story' }, { value: 'youtube', label: '🎬 YouTube' }, { value: 'link', label: '🔗 Link' }].map(t => (
          <button key={t.value} disabled={disabled} onClick={() => !disabled && onChange('type', t.value)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: material.type === t.value ? 600 : 400, background: material.type === t.value ? '#7F77DD' : '#fafafa', color: material.type === t.value ? '#fff' : '#888', border: `1.5px solid ${material.type === t.value ? '#7F77DD' : '#e8e8e8'}` }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
    <div>
      <FieldLabel>Title</FieldLabel>
      <WizardInput value={material.title || ''} onChange={e => onChange('title', e.target.value)} placeholder="e.g. The Little Red Hen" disabled={disabled} />
    </div>
    <div>
      <FieldLabel>{material.type === 'story' ? 'Story content' : 'URL'}</FieldLabel>
      {material.type === 'story'
        ? <WizardTextarea value={material.content || ''} onChange={e => onChange('content', e.target.value)} placeholder="Paste or type the story here…" disabled={disabled} rows={6} />
        : <WizardInput value={material.content || ''} onChange={e => onChange('content', e.target.value)} placeholder={material.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} disabled={disabled} />
      }
    </div>
  </div>
);

// ── Step 3 — Questions ────────────────────────────────────────────────────────
const StepQuestions = ({ questions, setQuestions, questionTypeOptions, fileList, setFileList, data, mode }) => {
  const isDisabled = mode === 'view';

  const QuestionModel = () => ({
    id: null, question_text: '', question_type_id: questionTypeOptions[0]?.value || null,
    points: 1, actual_answer: '', photo: null,
    use_word_scoring: true,
    choices: [{ id: null, choice_text: '', is_correct: false }, { id: null, choice_text: '', is_correct: false }],
  });

  const ChoiceModel = () => ({ id: null, choice_text: '', is_correct: false });

  const addQuestion    = () => { setQuestions(prev => [...prev, QuestionModel()]); setTimeout(() => { const el = document.getElementById('quiz-questions-end'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 60); };
  const removeQuestion = (qi) => setQuestions(prev => prev.filter((_, i) => i !== qi));
  const updateQuestion = (qi, field, value) => setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  const moveQuestion   = (qi, dir) => { setQuestions(prev => { const arr = [...prev]; const t = qi + dir; if (t < 0 || t >= arr.length) return arr; [arr[qi], arr[t]] = [arr[t], arr[qi]]; return arr; }); };
  const addChoice      = (qi) => setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, choices: [...q.choices, ChoiceModel()] } : q));
  const removeChoice   = (qi, ci) => setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, choices: q.choices.filter((_, j) => j !== ci) } : q));
  const updateChoice   = (qi, ci, field, value) => setQuestions(prev => prev.map((q, i) => {
    if (i !== qi) return q;
    const choices = q.choices.map((c, j) => { if (field === 'is_correct' && value) return { ...c, is_correct: j === ci }; return j === ci ? { ...c, [field]: value } : c; });
    return { ...q, choices };
  }));

  const handleCustomRequest = async (options, qi) => {
    const { file, onSuccess, onError, onProgress } = options;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      onProgress?.({ percent: 30 });
      const res = await axios.post(`/quizzes/${data?.id}/questions/upload-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onProgress?.({ percent: 100 });
      const uploaded = res.data?.data;
      updateQuestion(qi, 'photo', uploaded.filename);
      setFileList(prev => [...prev.filter(f => f.uid !== `question-${qi}`), { uid: `question-${qi}`, name: file.name, status: 'done', url: uploaded.url }]);
      onSuccess({ url: uploaded.url }, file);
    } catch (err) { onError?.(err); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: document.body.getAttribute('data-dark')==='1'?'#D0CFEE':'#333' }}>
          Questions
          <span style={{ marginLeft: 8, background: '#EEEDFE', color: '#534AB7', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{questions.length}</span>
        </div>
      </div>

      {questions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 20px', borderRadius: 10, background: document.body.getAttribute('data-dark')==='1'?'#1A1830':'#fafafa', border: document.body.getAttribute('data-dark')==='1'?'1.5px dashed #3D3A6B':'1.5px dashed #e0e0e0', color: document.body.getAttribute('data-dark')==='1'?'#5A5980':'#bbb', fontSize: 14, marginBottom: 14 }}>
          No questions yet — click "Add Question" below to get started.
        </div>
      )}

      {questions.map((question, qi) => {
        const selectedType     = questionTypeOptions?.find(o => o.value === question.question_type_id);
        const typeName         = selectedType?.label;
        const isMultipleChoice = typeName === 'Multiple Choice';
        const isTrueFalse      = typeName === 'True/False';
        const isReading        = typeName === 'Reading';
        const showChoices      = isMultipleChoice || isTrueFalse;

        return (
          <div key={qi} style={{ background: document.body.getAttribute('data-dark')==='1'?'#221F3D':'#fff', border: document.body.getAttribute('data-dark')==='1'?'1px solid #3D3A6B':'1px solid #e8e8e8', borderRadius: 12, marginBottom: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* Question header */}
            <div style={{ background: document.body.getAttribute('data-dark')==='1'?'#2D2A50':'#f8f6ff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: document.body.getAttribute('data-dark')==='1'?'1px solid #3D3A6B':'1px solid #eeebfb' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7F77DD', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {qi + 1}
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#534AB7' }}>
                Question {qi + 1}
                {typeName && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, background: '#EEEDFE', color: '#7F77DD', borderRadius: 4, padding: '1px 6px' }}>{typeName}</span>
                )}
                {isReading && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, background: '#E1F5EE', color: '#0F6E56', border: '1px solid #5DCAA5', borderRadius: 4, padding: '1px 7px' }}>
                    🔤 Word-by-Word
                  </span>
                )}
              </span>
              {!isDisabled && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {qi > 0 && <button onClick={() => moveQuestion(qi, -1)} style={arrowBtn}>↑</button>}
                  {qi < questions.length - 1 && <button onClick={() => moveQuestion(qi, 1)} style={arrowBtn}>↓</button>}
                  <button onClick={() => removeQuestion(qi)} style={{ ...arrowBtn, color: '#e74c3c' }}>×</button>
                </div>
              )}
            </div>

            {/* Question body */}
            <div style={{ padding: '14px 16px', display: 'grid', gap: 12 }}>

              {/* Question text */}
              <div>
                <FieldLabel>Question text <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(optional)</span></FieldLabel>
                <WizardTextarea value={question.question_text || ''} onChange={e => updateQuestion(qi, 'question_text', e.target.value)} placeholder="Type your question here… (leave blank to show only the answer field)" disabled={isDisabled} rows={2} />
              </div>

              {/* ✅ REMOVED: is_answer toggle — actual answer field is always shown */}
              {/* Actual answer field — always visible */}
              <div>
                <FieldLabel required>Actual answer</FieldLabel>
                <WizardInput
                  value={question.actual_answer || ''}
                  onChange={e => updateQuestion(qi, 'actual_answer', e.target.value)}
                  placeholder="Enter the correct answer"
                  disabled={isDisabled}
                />
              </div>

              {/* Type + Points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
                <div>
                  <FieldLabel required>Question type</FieldLabel>
                  <WizardSelect value={question.question_type_id} onChange={e => { updateQuestion(qi, 'question_type_id', e.target.value); updateQuestion(qi, 'choices', []); }} options={questionTypeOptions.map(o => ({ value: o.value, label: o.label }))} placeholder="Select type…" disabled={isDisabled} />
                </div>
                <div>
                  <FieldLabel required>Points</FieldLabel>
                  <WizardInput type="number" min={1} max={100} value={question.points || 1} onChange={e => updateQuestion(qi, 'points', parseInt(e.target.value) || 1)} disabled={isDisabled} />
                </div>
              </div>

              {/* Word-by-Word Scoring info — always on for Reading questions */}
              {isReading && (
                <div style={{ borderRadius: 10, padding: '12px 14px', background: '#f0faf5', border: '2px solid #5DCAA5' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F6E56', marginBottom: 4 }}>
                    🔤 Word-by-Word Scoring
                  </div>
                  <ScoringInfo />
                </div>
              )}

              {/* Photo upload — only available in Edit mode */}
              <div>
                <FieldLabel hint="(optional)">Image</FieldLabel>
                {mode === 'create' ? (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: '#fffbe6', border: '1px solid #ffe58f',
                    fontSize: 12, color: '#ad6800',
                  }}>
                    💡 Save the quiz first before adding images. You can add photos when editing the quiz.
                  </div>
                ) : (
                  <Upload
                    disabled={isDisabled} name="photo"
                    customRequest={opts => handleCustomRequest(opts, qi)}
                    accept="image/*"
                    fileList={fileList.filter(f => f.uid === `question-${qi}`)}
                    onChange={({ fileList: fl }) => setFileList(prev => [...prev.filter(f => f.uid !== `question-${qi}`), ...fl.map(f => ({ ...f, uid: `question-${qi}` }))])}
                    onRemove={async () => {
                      try {
                        await axios.delete(`/quizzes/${data?.id}/questions/delete-photo`, { data: { filename: questions[qi].photo } });
                        setFileList(prev => prev.filter(f => f.uid !== `question-${qi}`));
                        updateQuestion(qi, 'photo', null);
                      } catch (err) { console.error(err); }
                    }}
                    listType="picture-card" maxCount={1}
                  >
                    {fileList.some(f => f.uid === `question-${qi}`) ? null : (
                      <div style={{ fontSize: 12 }}><UploadOutlined /><div style={{ marginTop: 4 }}>Upload</div></div>
                    )}
                  </Upload>
                )}
              </div>

              {/* Choices (for Multiple Choice / True False) */}
              {showChoices && (
                <div>
                  <FieldLabel hint="— tap the circle to mark the correct answer">Answer choices</FieldLabel>
                  <div style={{ background: document.body.getAttribute('data-dark')==='1'?'#2D2A50':'#fafafa', borderRadius: 8, padding: '10px 10px 6px' }}>
                    {question.choices?.map((choice, ci) => (
                      <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                        <button disabled={isDisabled} onClick={() => !isDisabled && updateChoice(qi, ci, 'is_correct', true)} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: `2px solid ${choice.is_correct ? '#1D9E75' : '#d9d9d9'}`, background: choice.is_correct ? '#1D9E75' : 'transparent', color: choice.is_correct ? '#fff' : 'transparent', cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
                        <WizardInput value={choice.choice_text || ''} onChange={e => updateChoice(qi, ci, 'choice_text', e.target.value)} placeholder={`Option ${ci + 1}`} disabled={isDisabled || isTrueFalse} style={{ flex: 1 }} />
                        {!isDisabled && !isTrueFalse && question.choices.length > 2 && (
                          <button onClick={() => removeChoice(qi, ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: 18, padding: '0 2px' }}>×</button>
                        )}
                      </div>
                    ))}
                    {isMultipleChoice && !isDisabled && question.choices.length < 6 && (
                      <button onClick={() => addChoice(qi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7F77DD', fontSize: 13, fontWeight: 600, padding: '4px 0', fontFamily: 'inherit' }}>+ Add option</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div id="quiz-questions-end" />

      {!isDisabled && (
        <button onClick={addQuestion} style={{ width: '100%', padding: '11px', borderRadius: 10, background: '#7F77DD', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.target.style.opacity = '0.88'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          + Add Question
        </button>
      )}
    </div>
  );
};

const arrowBtn = { background: 'none', border: 'none', cursor: 'pointer', color: document.body.getAttribute('data-dark')==='1'?'#6B6A90':'#aaa', fontSize: 15, padding: '0 4px', fontFamily: 'inherit' };

// ── Step 4 — Review ───────────────────────────────────────────────────────────
const StepReview = ({ quizForm, material, questions, questionTypeOptions }) => {
  const diff     = DIFFICULTY_COLORS[quizForm.difficulty];
  const totalPts = questions.reduce((s, q) => s + (parseInt(q.points) || 0), 0);
  const diffLabels = {
    Introduction: 'Pre-Test', Easy: 'Low Reader', EasyPostTest: 'Low Reader Post-Test',
    Medium: 'Beginning Reader', MediumPostTest: 'Beginning Reader Post-Test',
    Hard: 'Developing Reader', HardPostTest: 'Developing Reader Post-Test',
    Expert: 'Grade Ready Reader', ExpertPostTest: 'Grade Ready Post-Test', PostTest: 'Post-Test',
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ background: document.body.getAttribute('data-dark')==='1'?'#221F3D':'#fff', border: document.body.getAttribute('data-dark')==='1'?'1px solid #3D3A6B':'1px solid #e8e8e8', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: document.body.getAttribute('data-dark')==='1'?'#D0CFEE':'#222' }}>{quizForm.title || <span style={{ color: document.body.getAttribute('data-dark')==='1'?'#4A4870':'#ccc' }}>(no title)</span>}</div>
        {quizForm.instructions && <div style={{ fontSize: 13, color: document.body.getAttribute('data-dark')==='1'?'#A09FD0':'#777', marginBottom: 10 }}>{quizForm.instructions}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {quizForm.grade_level && <span style={{ background: '#E6F1FB', color: '#185FA5', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{quizForm.grade_level}</span>}
          {quizForm.difficulty && diff && <span style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}`, borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{diffLabels[quizForm.difficulty] || quizForm.difficulty}</span>}
          {quizForm.time_limit && <span style={{ background: '#f5f5f5', color: document.body.getAttribute('data-dark')==='1'?'#7A79A0':'#888', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>⏱ {quizForm.time_limit} min</span>}
          <span style={{ background: '#EEEDFE', color: '#534AB7', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{questions.length} Q · {totalPts} pts</span>
        </div>
      </div>

      {(material.title || material.content) && (
        <div style={{ background: document.body.getAttribute('data-dark')==='1'?'#221F3D':'#fff', border: document.body.getAttribute('data-dark')==='1'?'1px solid #3D3A6B':'1px solid #e8e8e8', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: document.body.getAttribute('data-dark')==='1'?'#6B6A90':'#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Material</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: document.body.getAttribute('data-dark')==='1'?'#D0CFEE':'#333' }}>{material.title}</div>
          {material.content && <div style={{ fontSize: 12, color: document.body.getAttribute('data-dark')==='1'?'#6B6A90':'#aaa', marginTop: 2 }}>{material.type === 'story' ? `${material.content.slice(0, 80)}${material.content.length > 80 ? '…' : ''}` : material.content}</div>}
        </div>
      )}

      <div style={{ background: document.body.getAttribute('data-dark')==='1'?'#221F3D':'#fff', border: document.body.getAttribute('data-dark')==='1'?'1px solid #3D3A6B':'1px solid #e8e8e8', borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: document.body.getAttribute('data-dark')==='1'?'#6B6A90':'#aaa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Questions ({questions.length})</div>
        {questions.length === 0 && <div style={{ color: '#e74c3c', fontSize: 13 }}>⚠ No questions added yet.</div>}
        {questions.map((q, i) => {
          const selectedType = questionTypeOptions?.find(o => o.value === q.question_type_id);
          const typeName     = selectedType?.label;
          const isReading    = typeName === 'Reading';
          // ✅ actual_answer is now always the answer field
          const hasCorrect   = !!q.actual_answer?.trim();

          return (
            <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: i < questions.length - 1 ? (document.body.getAttribute('data-dark')==='1'?'1px solid #2D2A50':'1px solid #f0f0f0') : 'none' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#EEEDFE', color: '#534AB7', fontSize: 11, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: document.body.getAttribute('data-dark')==='1'?'#D0CFEE':'#222', marginBottom: 4 }}>
                  {q.question_text || <span style={{ color: document.body.getAttribute('data-dark')==='1'?'#4A4870':'#ccc', fontStyle:'italic' }}>(no question text)</span>}
                </div>
                {isReading && (
                  <div style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#E1F5EE', color: '#0F6E56', border: '1px solid #5DCAA5' }}>
                      🔤 Word-by-Word Scoring
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {/* ✅ Always show actual_answer in review */}
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: '#E1F5EE', color: '#0F6E56', border: '1px solid #9FE1CB' }}>
                    ✓ {q.actual_answer || '(no answer yet)'}
                  </span>
                </div>
                {!hasCorrect && <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>⚠ No correct answer entered</div>}
              </div>
              <div style={{ fontSize: 11, color: document.body.getAttribute('data-dark')==='1'?'#5A5980':'#bbb', flexShrink: 0 }}>{q.points}pt</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Validation ────────────────────────────────────────────────────────────────
const validateQuizStep = (step, quizForm, questions) => {
  if (step === 0) {
    if (!quizForm.title?.trim()) return 'Please enter a quiz title.';
    if (!quizForm.grade_level)   return 'Please select a grade level.';
    if (!quizForm.difficulty)    return 'Please select a difficulty.';
  }
  if (step === 2) {
    if (questions.length === 0) return 'Please add at least one question.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_type_id)    return `Question ${i + 1}: please select a question type.`;
      if (!q.points || q.points < 1) return `Question ${i + 1}: please set valid points.`;
      // ✅ actual_answer is now always required
      if (!q.actual_answer?.trim()) return `Question ${i + 1}: please enter the correct answer.`;
    }
  }
  return null;
};

// ── Main CrudModal ────────────────────────────────────────────────────────────
const CrudModal = ({ visible, onCancel, mode, title, data, fields, onSubmit, loading = false, authUser, questionTypeOptions = [] }) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const isDark = document.body.getAttribute('data-dark') === '1';
  const [questions,  setQuestions]  = useState([]);
  const [fileList,   setFileList]   = useState([]);
  const [material,   setMaterial]   = useState({ type: 'story', title: '', content: '' });
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardError,setWizardError]= useState('');
  const [quizForm,   setQuizForm]   = useState({ title: '', instructions: '', grade_level: '', difficulty: '', time_limit: '', is_active: false });

  const isQuiz = title === 'Quiz';

  useEffect(() => {
    if (!visible) return;
    setWizardStep(0); setWizardError('');

    if (mode === 'edit' || mode === 'view') {
      form.setFieldsValue(data || {});
      if (isQuiz) {
        setQuizForm({ title: data?.title || '', instructions: data?.instructions || '', grade_level: data?.grade_level || '', difficulty: data?.difficulty || '', time_limit: data?.time_limit || '', is_active: !!data?.is_active });
        if (data?.questions) {
          setQuestions(data.questions.map(q => {
            // ✅ Always use actual_answer — derive from choices if needed
            const correctChoice = q.choices?.find(c => c.is_correct);
            const actualAnswer  = correctChoice?.choice_text || q.actual_answer || '';
            return {
              ...q,
              actual_answer:    actualAnswer,
              use_word_scoring: q.use_word_scoring === true,
              choices:          q.choices || [],
            };
          }));
          setFileList(data.questions.map((q, i) => q.photo ? { uid: `question-${i}`, name: q.photo.split('/').pop(), status: 'done', url: q.photo.startsWith('http') ? q.photo : `${nonApi}/${q.photo}` } : null).filter(Boolean));
        } else { setQuestions([]); setFileList([]); }
        setMaterial(data?.material ? { id: data.material.id, type: data.material.type || 'story', title: data.material.title || '', content: data.material.content || '' } : { type: 'story', title: '', content: '' });
      } else { setQuestions([]); }
    } else if (mode === 'create') {
      form.resetFields(); setQuestions([]); setFileList([]);
      setMaterial({ type: 'story', title: '', content: '' });
      setQuizForm({ title: '', instructions: '', grade_level: '', difficulty: '', time_limit: '', is_active: false });
    }
  }, [data, mode, visible]);

  const wizardNext = () => { const err = validateQuizStep(wizardStep, quizForm, questions); if (err) { setWizardError(err); return; } setWizardError(''); setWizardStep(s => Math.min(s + 1, QUIZ_STEPS.length - 1)); };
  const wizardBack = () => { setWizardError(''); setWizardStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    if (mode === 'delete') { setSubmitLoading(true); try { await onSubmit(data); onCancel(); } catch (e) { console.error(e); } finally { setSubmitLoading(false); } return; }
    setSubmitLoading(true);
    try {
      if (isQuiz) {
        if (questions.length === 0) { message.error('Please add at least one question.'); setSubmitLoading(false); return; }
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          // ✅ Validate actual_answer always
          if (!q.actual_answer?.trim()) { message.error(`Question ${i+1}: please enter the correct answer.`); setSubmitLoading(false); return; }
          if (!q.question_type_id)      { message.error(`Question ${i+1}: please select a question type.`); setSubmitLoading(false); return; }
          if (!q.points || q.points < 1){ message.error(`Question ${i+1}: please set valid points.`); setSubmitLoading(false); return; }
        }

        const baseData = {
          ...(mode === 'edit' ? data : {}), ...quizForm,
          time_limit: quizForm.time_limit ? parseInt(quizForm.time_limit) : null,
          material: (material.title || material.content) ? material : null,
        };
        if (mode === 'edit' && data?.id) baseData.id = data.id;

        const hasFileUploads = questions.some(q => q.photo instanceof File);

        if (hasFileUploads) {
          const fd = new FormData();
          if (mode === 'edit' && baseData.id) fd.append('id', baseData.id);
          Object.keys(baseData).forEach(key => {
            if (key !== 'questions') {
              const v = baseData[key];
              fd.append(key, typeof v === 'object' && v !== null ? JSON.stringify(v) : v ?? '');
            }
          });
          questions.forEach((q, qi) => {
            fd.append(`questions[${qi}][question_text]`, q.question_text || '');
            fd.append(`questions[${qi}][question_type_id]`, q.question_type_id || '');
            fd.append(`questions[${qi}][points]`, q.points || 1);
            fd.append(`questions[${qi}][use_word_scoring]`, '1');
            // ✅ Always send as single correct choice
            fd.append(`questions[${qi}][choices][0][choice_text]`, q.actual_answer || '');
            fd.append(`questions[${qi}][choices][0][is_correct]`, '1');
            if (q.id) fd.append(`questions[${qi}][id]`, q.id);
            if (q.photo) fd.append(`questions[${qi}][photo]`, q.photo);
          });
          await onSubmit(fd);
        } else {
          // ✅ Always submit as single correct choice from actual_answer
          const processedQuestions = questions.map(q => ({
            ...q,
            use_word_scoring: true,
            choices: [{ choice_text: q.actual_answer || '', is_correct: true }],
          }));
          await onSubmit({ ...baseData, questions: processedQuestions });
        }
      } else {
        const visibleFields = fields.filter(f => f.type !== 'hidden');
        let values = {};
        try { values = await form.validateFields(visibleFields.map(f => f.name)); } catch { message.error('Please fill in all required fields correctly'); setSubmitLoading(false); return; }
        fields.filter(f => f.type === 'hidden').forEach(f => { values[f.name] = form.getFieldValue(f.name) ?? data?.[f.name]; });
        let submitData = mode === 'edit' ? { ...data, ...values } : values;
        if (!submitData.id && data?.id) submitData.id = data.id;
        await onSubmit(submitData);
      }
      onCancel();
    } catch (e) { console.error('Submit error:', e); }
    finally { setSubmitLoading(false); }
  };

  const getModalTitle = () => `${mode?.charAt(0).toUpperCase() + mode?.slice(1)} ${title}`;

  const formatDisplayValue = (value, record, fieldName) => {
    if (!fieldName) return value ?? '-';
    const path     = Array.isArray(fieldName) ? fieldName : fieldName.split('.');
    const resolved = path.reduce((acc, key) => (acc ? acc[key] : undefined), record);
    if (resolved === null || resolved === undefined || resolved === '') return '-';
    if (typeof resolved === 'object' && resolved.label) return resolved.label;
    return String(resolved);
  };

  const renderFormField = (field) => {
    const { name, label, type = 'text', required = false, placeholder, options, rules = [] } = field;
    const fieldRules = required ? [{ required: true, message: `Please input ${label.toLowerCase()}!` }, ...rules] : rules;
    switch (type) {
      case 'textarea': return <Form.Item key={name} name={name} label={label} rules={fieldRules}><Input.TextArea placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled={mode === 'view'} rows={4} /></Form.Item>;
      case 'select':   return <Form.Item key={name} name={name} label={label} rules={fieldRules}><Select placeholder={placeholder || `Select ${label.toLowerCase()}`} disabled={mode === 'view'}>{options?.map(opt => typeof opt === 'string' ? <Select.Option key={opt} value={opt}>{opt}</Select.Option> : <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>)}</Select></Form.Item>;
      case 'number':   return <Form.Item key={name} name={name} label={label} rules={fieldRules}><Input type="number" placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled={mode === 'view'} /></Form.Item>;
      default:         return <Form.Item key={name} name={name} label={label} rules={fieldRules}><Input placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled={mode === 'view'} /></Form.Item>;
    }
  };

  const renderViewContent = () => {
    if (mode !== 'view') return null;
    const visibleFields = fields.filter(f => f.type !== 'hidden');
    return (
      <div>
        <Descriptions column={1} bordered>{visibleFields.map(f => <Descriptions.Item key={f.name} label={f.label}>{formatDisplayValue(data?.[f.name], data, f.name)}</Descriptions.Item>)}</Descriptions>
        {title === 'Quiz' && (
          <>
            {material && (material.title || material.content) ? (
              <div style={{ marginTop: 24 }}>
                <Divider orientation="left">Material (Optional)</Divider>
                <Card size="small">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Type">{material.type?.charAt(0).toUpperCase() + material.type?.slice(1)}</Descriptions.Item>
                    {material.title && <Descriptions.Item label="Title">{material.title}</Descriptions.Item>}
                    <Descriptions.Item label={material.type === 'story' ? 'Story Content' : 'URL'}>{material.type === 'youtube' || material.type === 'link' ? <a href={material.content} target="_blank" rel="noopener noreferrer">{material.content}</a> : <span>{material.content}</span>}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            ) : <div style={{ marginTop: 24 }}><Divider orientation="left">Material (Optional)</Divider><p style={{ color: document.body.getAttribute('data-dark')==='1'?'#7A79A0':'#888', fontStyle: 'italic' }}>No material added</p></div>}
            {questions.length > 0 && <div style={{ marginTop: 24 }}><Divider orientation="left">Questions</Divider><StepQuestions questions={questions} setQuestions={setQuestions} questionTypeOptions={questionTypeOptions} fileList={fileList} setFileList={setFileList} data={data} mode="view" /></div>}
          </>
        )}
      </div>
    );
  };

  const renderDeleteContent = () => {
    if (mode !== 'delete') return null;
    return (
      <div>
        <p>Are you sure you want to delete this {title.toLowerCase()}?</p>
        {data && <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>{fields.slice(0, 3).map(f => <p key={f.name}><strong>{f.label}:</strong> {formatDisplayValue(data[f.name])}</p>)}</div>}
        <p style={{ color: '#ff4d4f', marginTop: 16 }}>This action cannot be undone.</p>
      </div>
    );
  };

  const renderFooter = () => {
    if (mode === 'view')   return [<Button key="close" onClick={onCancel}>Close</Button>];
    if (mode === 'delete') return [<Button key="cancel" onClick={onCancel}>Cancel</Button>, <Button key="delete" type="primary" danger loading={submitLoading} onClick={handleSubmit}>Delete</Button>];
    if (isQuiz && (mode === 'create' || mode === 'edit')) {
      return [
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        wizardStep > 0 && <Button key="back" icon={<ArrowLeftOutlined />} onClick={wizardBack}>Back</Button>,
        wizardStep < QUIZ_STEPS.length - 1
          ? <Button key="next" type="primary" icon={<ArrowRightOutlined />} iconPosition="end" onClick={wizardNext}>Next</Button>
          : <Button key="submit" type="primary" icon={<CheckOutlined />} loading={submitLoading} onClick={handleSubmit}>{mode === 'create' ? 'Create Quiz' : 'Save Changes'}</Button>,
      ].filter(Boolean);
    }
    return [<Button key="cancel" onClick={onCancel}>Cancel</Button>, <Button key="submit" type="primary" loading={submitLoading} onClick={handleSubmit}>{mode === 'create' ? 'Create' : 'Update'}</Button>];
  };

  return (
    <Modal
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 600, fontSize: 18, color: document.body.getAttribute('data-dark')==='1'?'#D0CFEE':undefined }}>{getModalTitle()}</span></div>}
      open={visible} onCancel={onCancel} footer={renderFooter()}
      width={isQuiz ? 720 : 1000} confirmLoading={loading}
      bodyStyle={{ maxHeight: '76vh', overflowY: 'auto', padding: '24px 28px', background: isDark ? '#1A1830' : '#fafafa', borderRadius: 8, color: isDark ? '#D0CFEE' : undefined }}
      styles={{ header: { background: isDark ? '#1A1830' : 'white', borderBottom: isDark ? '1px solid #2D2A50' : undefined }, footer: { background: isDark ? '#1A1830' : 'white', borderTop: isDark ? '1px solid #2D2A50' : undefined }, content: { background: isDark ? '#1A1830' : 'white' } }}
      maskClosable={false} centered
    >
      {mode === 'view'   && renderViewContent()}
      {mode === 'delete' && renderDeleteContent()}
      {(mode === 'create' || mode === 'edit') && !isQuiz && (
        <Form key={mode + (data?.id || '')} form={form} layout="vertical" initialValues={mode === 'edit' ? data : {}} preserve={false}>
          {fields.map(f => renderFormField(f))}
        </Form>
      )}
      {(mode === 'create' || mode === 'edit') && isQuiz && (
        <div>
          <StepBar current={wizardStep} />
          {wizardStep === 0 && <StepInfo form={quizForm} onChange={(k, v) => setQuizForm(prev => ({ ...prev, [k]: v }))} disabled={false} />}
          {wizardStep === 1 && <StepMaterial material={material} onChange={(k, v) => setMaterial(prev => ({ ...prev, [k]: v }))} disabled={false} />}
          {wizardStep === 2 && <StepQuestions questions={questions} setQuestions={setQuestions} questionTypeOptions={questionTypeOptions} fileList={fileList} setFileList={setFileList} data={data} mode={mode} />}
          {wizardStep === 3 && <StepReview quizForm={quizForm} material={material} questions={questions} questionTypeOptions={questionTypeOptions} />}
          {wizardError && <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', fontSize: 13 }}>⚠ {wizardError}</div>}
        </div>
      )}
    </Modal>
  );
};

export default CrudModal;
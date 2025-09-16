import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Spin, notification } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from "../composables/useAuth";
import { useApi } from "../composables/useApi";
import DataTable from './components/DataTable';
import Settings from './QuestionTypes';
import axios from '../plugins/axios';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const titleMap = {
  quizzes: "Quiz",
  "quiz-scores": "Quiz Attempt",
  students: "Student",
  teachers: "Teacher",
  settings: "Settings",
  "question-types": "Question Types",
};

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['students']);
  const [openKeys, setOpenKeys] = useState([]);
  const [endpoint, setEndpoint] = useState('/students');
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(true);
  const [showEdit, setShowEdit] = useState(true);
  const [showDelete, setShowDelete] = useState(true);
  const [questionTypes, setQuestionTypes] = useState([]);

  const { authUser, logout, getUser } = useAuth();
  const { loading, items, index, store, update, destroy, show } = useApi(endpoint);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    getUser();
  }, []);

  const getQuestionTypeOptions = async () => {
    try {
      const response = await axios.get('/question-types', {
        params: { all: true }
      });

      const options = [
        ...response.data.data.map((item) => ({
          label: item.label,
          value: item.id
        }))
      ];

      console.log('Question Types:', options);
      setQuestionTypes(options);

    } catch (error) {
      console.error('Failed to fetch question types:', error);
      setQuestionTypes([]);
    }
  };

  useEffect(() => {
    const activeKey = selectedKeys[0];
    switch (activeKey) {
      case "students":
        setEndpoint("/students");
        setShowCreate(false);
        setShowView(true);
        setShowEdit(true);
        setShowDelete(true);
        break;
      case "teachers":
        setEndpoint("/users");
        setShowCreate(true);
        setShowView(true);
        setShowEdit(true);
        setShowDelete(true);
        break;
      case "quizzes":
        setEndpoint("/quizzes");
        setShowCreate(true);
        setShowView(true);
        setShowEdit(true);
        setShowDelete(true);
        getQuestionTypeOptions();
        break;
      case "quiz-scores":
        setEndpoint("/quiz-attempts");
        setShowCreate(false);
        setShowView(true);
        setShowEdit(false);
        setShowDelete(false);
        break;
      default:
        setEndpoint("");
    }
  }, [selectedKeys]);

  useEffect(() => {
    if (endpoint) {
      console.log('Dashboard - Calling index() for endpoint:', endpoint);
      index().then(() => {
        console.log('Dashboard - index() completed, items:', items);
      }).catch((error) => {
        console.error('Dashboard - index() error:', error);
      });
    }
  }, [endpoint]);

  // Menu items configuration
  const menuItems = [
    {
      key: 'students',
      icon: <UserOutlined />,
      label: 'Students',
    },
    {
      key: 'teachers',
      icon: <TeamOutlined />,
      label: 'Teachers',
    },
    {
      key: 'quizzes',
      icon: <BookOutlined />,
      label: 'Quizzes',
    },
    {
      key: 'quiz-scores',
      icon: <BarChartOutlined />,
      label: 'Quiz Scores',
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'Settings',
    //   children: [
    //     {
    //       key: 'question-types',
    //       icon: <QuestionCircleOutlined />,
    //       label: 'Question Types',
    //     },
    //   ],
    // },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  // Field definitions for different entities
  const getFieldsConfig = (type) => {
    switch (type) {
      case 'students':
        return [
          { name: 'nickname', label: 'Nickname', required: true },
          {
            name: 'grade_level', label: 'Grade Level',
            type: 'select',
            options: [
              { value: 'Kinder', label: 'Kinder' },
              { value: 'Grade 1', label: 'Grade 1' },
            ],
            required: true
          },
          {
            name: 'section', label: 'Section',
            type: 'select',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ],
            required: true
          },
        ];

      case 'teachers':
        return [
          { name: 'username', label: 'Username', required: true },
          { name: 'first_name', label: 'First Name', required: true },
          { name: 'last_name', label: 'Last Name', required: true },
        ];

      case 'quizzes':
        return [
          { name: 'title', label: 'Title', required: true },
          { name: 'instructions', label: 'Instructions', type: 'textarea' },
          {
            name: 'grade_level',
            label: 'Grade Level',
            type: 'select',
            options: [
              { value: 'Kinder', label: 'Kinder' },
              { value: 'Grade 1', label: 'Grade 1' }
            ],
            required: true
          },
          {
            name: 'difficulty',
            label: 'Difficulty',
            type: 'select',
            options: [
              { value: 'Introduction', label: 'Introduction' },
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' }
            ],
            required: true
          },
          { name: 'time_limit', label: 'Time Limit (minutes)', type: 'number' },
          // {
          //   name: 'is_active',
          //   label: 'Active?',
          //   type: 'select',
          //   options: [
          //     { value: 1, label: 'Yes' },
          //     { value: 0, label: 'No' }
          //   ]
          // },
        ];

      case 'quiz-scores':
        return [
          { name: 'quiz.title', label: 'Quiz Title' },
          { name: 'student.nickname', label: 'Student Name' },
          { name: 'student.section', label: 'Section' },
          { name: 'student.grade_level', label: 'Grade Level' },
          { name: 'score', label: 'Score' },
        ];

      default:
        return [];
    }
  };

  // Column definitions for different entities
  const getColumnsConfig = (type) => {
    switch (type) {
      case 'students':
        return [
          { title: "Nickname", dataIndex: "nickname", key: "nickname" },
          { title: "Grade Level", dataIndex: "grade_level", key: "grade_level" },
          { title: "Section", dataIndex: "section", key: "section" },
        ];

      case 'teachers':
        return [
          { title: "Username", dataIndex: "username", key: "username" },
          { title: "First Name", dataIndex: "first_name", key: "first_name" },
          { title: "Last Name", dataIndex: "last_name", key: "last_name" },
        ];

      case 'quizzes':
        return [
          { title: "Title", dataIndex: "title", key: "title" },
          { title: "Instructions", dataIndex: "instructions", key: "instructions" },
          { title: "Grade Level", dataIndex: "grade_level", key: "grade_level" },
          { title: "Difficulty", dataIndex: "difficulty", key: "difficulty" },
          { title: "Time Limit", dataIndex: "time_limit", key: "time_limit" },
          {
            title: "Active",
            dataIndex: "is_active",
            key: "is_active",
            render: (val) => (val ? "Yes" : "No")
          },
          {
            title: "Questions",
            dataIndex: "questions",
            key: "questions",
            render: (questions) => questions?.length || 0,
          }
        ];

      case 'quiz-scores':
        return [
          {
            title: "Quiz Title",
            dataIndex: ["quiz", "title"],
            key: "quiz_title",
            render: (_, record) => record.quiz?.title || "N/A",
          },
          {
            title: "Student Name",
            dataIndex: ["student", "nickname"],
            key: "student_name",
            render: (_, record) => record.student?.nickname || "N/A",
          },
          {
            title: "Section",
            dataIndex: ["student", "section"],
            key: "section",
            render: (_, record) => record.student?.section || "N/A",
          },
          {
            title: "Grade Level",
            dataIndex: ["student", "grade_level"],
            key: "grade_level",
            render: (_, record) => record.student?.grade_level || "N/A",
          },
          {
            title: "Score",
            dataIndex: "score",
            key: "score",
          },
        ];

      default:
        return [];
    }
  };

  const handleCreate = async (formData) => {
    try {
      console.log('Creating with data:', formData);
      const { id, ...createData } = formData;

      // For quizzes, map questions to match backend structure
      if (selectedKeys[0] === 'quizzes' && createData.questions) {
        createData.questions = createData.questions.map((question) => ({
          question_text: question.question_text,
          question_type_id: question.question_type_id, // updated field
          points: parseInt(question.points) || 1,
          choices: question.choices?.map((choice) => ({
            choice_text: choice.choice_text,
            is_correct: choice.is_correct || false
          })) || []
        }));
      }

      await store(createData);
      await index();
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      console.log('HandleUpdate received:', formData);
      console.log('Is FormData:', formData instanceof FormData);

      let id;

      if (formData instanceof FormData) {
        // Handle FormData (with file uploads) - Laravel format
        id = formData.get('id');
        console.log('ID from FormData:', id);

        if (!id) {
          throw new Error('ID is required for update operation');
        }

        // For Laravel FormData with array notation, we can send it directly
        // Laravel will automatically parse questions[0][photo], questions[0][question_text], etc.
        console.log('Sending FormData directly to Laravel with array notation');

        // Log FormData contents for debugging
        console.log('=== FormData being sent to API ===');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
        }

        // Send FormData directly - Laravel will handle the array notation
        await update(id, formData);

      } else {
        // Handle regular object
        id = formData.id;

        if (!id) {
          throw new Error('ID is required for update operation');
        }

        const { id: _, ...updateData } = formData;

        // For quizzes, map questions to match backend structure
        if (selectedKeys[0] === 'quizzes' && updateData.questions) {
          updateData.questions = updateData.questions.map((question) => ({
            id: question.id,
            question_text: question.question_text,
            question_type_id: question.question_type_id,
            points: parseInt(question.points) || 1,
            photo: question.photo || null, // Include photo path
            choices: question.choices?.map((choice) => ({
              id: choice.id,
              choice_text: choice.choice_text,
              is_correct: choice.is_correct || false
            })) || []
          }));
        }

        console.log('Sending JSON data:', updateData);
        await update(id, updateData);
      }

      await index();
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  const handleDelete = async (record) => {
    try {
      if (!record.id) {
        throw new Error('ID is required for delete operation');
      }

      await destroy(record.id);
      await index();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  const handleView = async (record) => {
    try {
      if (selectedKeys[0] === 'quizzes' && show && record.id) {
        const response = await show(record.id);
        return response;
      }
      return record;
    } catch (error) {
      console.error('View error:', error);
      return record;
    }
  };

  const handleMenuClick = async ({ key }) => {
    if (key === 'logout') {
      await logout();
    } else {
      setSelectedKeys([key]);
    }
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const getPageTitle = () => {
    const activeKey = selectedKeys[0];
    switch (activeKey) {
      case 'students':
        return 'Students Management';
      case 'teachers':
        return 'Teachers Management';
      case 'quizzes':
        return 'Quizzes Management';
      case 'quiz-scores':
        return 'Quiz Scores';
      case 'question-types':
        return 'Question Types';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    const activeKey = selectedKeys[0];

    if (activeKey === 'question-types') {
      return <Settings />;
    }

    if (['students', 'teachers', 'quizzes', 'quiz-scores'].includes(activeKey)) {
      return (
        <DataTable
          title={titleMap[activeKey] || activeKey}
          data={items}
          loading={loading}
          columns={getColumnsConfig(activeKey)}
          fields={getFieldsConfig(activeKey)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onView={handleView}
          showCreate={showCreate}
          showView={showView}
          showEdit={showEdit}
          showDelete={showDelete}
          authUser={authUser}
          questionTypeOptions={questionTypes}
        />
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Welcome to the Dashboard</Title>
        <p>Select an option from the menu to get started.</p>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', minWidth: '100vw' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
        }}
      >
        <div style={{
          height: 64,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 16,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'DB' : 'Dashboard'}
        </div>

        {!collapsed && authUser && (
          <div style={{
            padding: '0 16px 16px',
            color: 'rgba(255, 255, 255, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 16
          }}>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>
              {authUser.first_name} {authUser.last_name}
            </div>
            <div style={{ fontSize: 12 }}>
              Administrator
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: 0,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Title level={3} style={{ margin: 0, flex: 1 }}>
            {getPageTitle()}
          </Title>
        </Header>

        <Content style={{
          margin: 16,
          background: '#fff',
          borderRadius: 8,
          overflow: 'auto'
        }}>
          <Spin spinning={loading && selectedKeys[0] !== 'question-types'}>
            <div style={{ padding: 24, minHeight: 360 }}>
              {renderContent()}
            </div>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaTachometerAlt, FaUsers, FaCog, FaChartBar, FaQuestionCircle, FaSignOutAlt, FaUserGraduate, FaClipboardList, FaBook, FaPoll } from 'react-icons/fa';
import { useAuth } from "../composables/useAuth"
import { useApi } from "../composables/useApi"
import DataTable from './components/DataTable';

const iconMap = {
  Dashboard: <FaTachometerAlt />,
  Students: <FaUserGraduate />,
  Sessions: <FaClipboardList />,
  Quizzes: <FaBook />,
  'Quiz Scores': <FaPoll />,
  Users: <FaUsers />,
  Settings: <FaCog />,
  Reports: <FaChartBar />,
  Help: <FaQuestionCircle />,
  Logout: <FaSignOutAlt />,
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [endpoint, setEndpoint] = useState('/users');

  const { authUser, logout, getUser } = useAuth();
  const { loading, items, index, store, update, destroy } = useApi(endpoint);

  const [showCreate, setShowCreate] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    switch (activeMenu) {
      case "Students":
        setEndpoint("/students");
        setShowCreate(false)
        break;
      case "Sessions":
        setEndpoint("/sessions");
        setShowCreate(true)
        break;
      case "Quizzes":
        setEndpoint("/quizzes");
        setShowCreate(true)
        break;
      case "Quiz Scores":
        setEndpoint("/quiz-scores");
        setShowCreate(true)

        break;
      default:
        setEndpoint("");
    }

    if (endpoint) {
      index();
    }
  }, [activeMenu, endpoint]);

  // Field definitions for different entities
  const getFieldsConfig = (type) => {
    switch (type) {
      case 'Students':
        return [
          { name: 'nickname', label: 'Nickname', required: true },
          { name: 'grade_level', label: 'Grade Level', required: true },
          { name: 'section', label: 'Section', required: true },
        ];

      case 'Sessions':
        return [
          { name: 'student_id', label: 'Student ID', type: 'number', required: true },
          { name: 'type', label: 'Session Type', required: true },
        ];

      case 'Quizzes':
        return [
          { name: 'name', label: 'Quiz Name', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
        ];

      case 'Quiz Scores':
        return [
          { name: 'student_id', label: 'Student ID', type: 'number', required: true },
          { name: 'quiz_id', label: 'Quiz ID', type: 'number', required: true },
          {
            name: 'score', label: 'Score', type: 'number', required: true,
            rules: [{ type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' }]
          },
        ];

      default:
        return [];
    }
  };

  // Column definitions for different entities
  const getColumnsConfig = (type) => {
    switch (type) {
      case 'Students':
        return [
          { title: "Nickname", dataIndex: "nickname", key: "nickname" },
          { title: "Grade Level", dataIndex: "grade_level", key: "grade_level" },
          { title: "Section", dataIndex: "section", key: "section" },
        ];

      case 'Sessions':
        return [
          { title: "Student ID", dataIndex: "student_id", key: "student_id" },
          { title: "Type", dataIndex: "type", key: "type" },
          {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => new Date(timestamp).toLocaleString()
          },
        ];

      case 'Quizzes':
        return [
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Description", dataIndex: "description", key: "description" },
        ];

      case 'Quiz Scores':
        return [
          { title: "Student ID", dataIndex: "student_id", key: "student_id" },
          { title: "Quiz ID", dataIndex: "quiz_id", key: "quiz_id" },
          { title: "Score", dataIndex: "score", key: "score" },
          {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => new Date(timestamp).toLocaleString()
          },
        ];

      default:
        return [];
    }
  };

  const handleCreate = async (formData) => {
    await store(formData);
    await index(); // Refresh the list
  };

  const handleUpdate = async (formData) => {
    await update(formData.id, formData);
    await index(); // Refresh the list
  };

  const handleDelete = async (record) => {
    await destroy(record.id);
    await index(); // Refresh the list
  };

  const renderContent = () => {
    if (activeMenu === 'Dashboard') {
      return (
        <div>
          <p>Welcome to the dashboard template with enhanced CRUD functionality.</p>
        </div>
      );
    }

    // For data-driven sections, use the enhanced DataTable
    if (['Students', 'Sessions', 'Quizzes', 'Quiz Scores'].includes(activeMenu)) {
      return (
        <DataTable
          title={activeMenu.slice(0, -1)} // Remove 's' from plural
          data={items}
          loading={loading}
          columns={getColumnsConfig(activeMenu)}
          fields={getFieldsConfig(activeMenu)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          showCreate={showCreate}
          showView={true}
          showEdit={true}
          showDelete={true}
        />
      );
    }

    return <div>Content for {activeMenu}</div>;
  };

  const handleMenuClick = async (item) => {
    if (item === 'Logout') {
      await logout();
    } else {
      setActiveMenu(item);
    }
  };

  return (
    <div className="td2-container">
      <button className="toggle-btn sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? '×' : '☰'}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="profile-info">
          <h3>{authUser?.first_name}</h3>
          <p>{authUser?.role?.name}</p>
        </div>
        <ul className="menu">
          {['Students', 'Sessions', 'Quizzes', 'Quiz Scores', 'Logout'].map(item => (
            <li
              key={item}
              onClick={() => handleMenuClick(item)}
              style={{
                fontWeight: activeMenu === item ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {iconMap[item]}
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>{activeMenu}</h1>
        </header>
        <section className="content" style={{ padding: '20px' }}>
          {renderContent()}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
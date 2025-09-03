import { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaTachometerAlt, FaUsers, FaCog, FaChartBar, FaQuestionCircle, FaSignOutAlt, FaUserGraduate, FaClipboardList, FaBook, FaPoll } from 'react-icons/fa';
import { useAuth } from "../composables/useAuth"
import { useApi } from "../composables/useApi"
import DataTable from './components/DataTable';

const iconMap = {
  Dashboard: <FaTachometerAlt />,
  Students: <FaUserGraduate />,
  Teachers: <FaClipboardList />,
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
  const { loading, items, index, store, update, destroy, show } = useApi(endpoint);

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
      case "Teachers":
        setEndpoint("/users");
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
  }, [activeMenu]);

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

  // Field definitions for different entities
  const getFieldsConfig = (type) => {
    switch (type) {
      case 'Students':
        return [
          { name: 'nickname', label: 'Nickname', required: true },
          { name: 'grade_level', label: 'Grade Level', required: true },
          { name: 'section', label: 'Section', required: true },
        ];

      case 'Teachers':
        return [
          { name: 'username', label: 'Username', required: true },
          { name: 'first_name', label: 'First Name', required: true },
          { name: 'last_name', label: 'Last Name', required: true },
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

      case 'Teachers':
        return [
          { title: "Username", dataIndex: "username", key: "username" },
          { title: "First Name", dataIndex: "first_name", key: "first_name" },
          { title: "Last Name", dataIndex: "last_name", key: "last_name" },
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
    try {
      // Remove id field for create operations
      const { id, ...createData } = formData;
      await store(createData);
      await index(); // Refresh the list
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      if (!formData.id) {
        throw new Error('ID is required for update operation');
      }

      // Separate id from the rest of the data
      const { id, ...updateData } = formData;
      await update(id, updateData);
      await index(); // Refresh the list
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
      await index(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  const handleView = async (record) => {
    try {
      // If you need to fetch fresh data for viewing
      if (show && record.id) {
        return await show(record.id);
      }
      return record;
    } catch (error) {
      console.error('View error:', error);
      return record; // Fallback to using the record data
    }
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
    if (['Students', 'Teachers', 'Quizzes', 'Quiz Scores'].includes(activeMenu)) {
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
          onView={handleView}
          showCreate={showCreate}
          showView={true}
          showEdit={true}
          showDelete={true}
          authUser={authUser}
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
          <h3>{authUser?.first_name} {authUser?.last_name}</h3>
        </div>
        <ul className="menu">
          {['Students', 'Teachers', 'Quizzes', 'Quiz Scores', 'Logout'].map(item => (
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
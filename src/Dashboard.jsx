import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Spin, Avatar, Tooltip, Badge } from 'antd';
import {
  UserOutlined, TeamOutlined, BookOutlined, BarChartOutlined,
  LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined,
  BellOutlined, SettingOutlined, LineChartOutlined, SmileOutlined, HomeOutlined,
} from '@ant-design/icons';
import { useAuth } from "../composables/useAuth";
import { useApi } from "../composables/useApi";
import DataTable from './components/DataTable';
import Settings from './QuestionTypes';
import axios from '../plugins/axios';
import LMSAnalyticsDashboard from "./components/LMSAnalyticsDashboard";
import StudentProgression from "./StudentProgression";
import FeedbackDashboard from "./FeedbackDashboard";

const { Sider, Content } = Layout;

const C = {
  primary:      '#6C63FF',
  secondary:    '#FF6584',
  accent:       '#43D9AD',
  warning:      '#FFB830',
  bg:           '#F0F2FF',
  surface:      '#FFFFFF',
  sidebar:      '#1E1B4B',
  sidebarHover: 'rgba(108,99,255,0.18)',
  sidebarActive:'rgba(108,99,255,0.32)',
  text:         '#1A1A2E',
  muted:        '#6B7280',
};

const D = (light, dark, isDark) => isDark ? dark : light;

const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif !important; background: ${C.bg} !important; }
    body[data-dark="1"] { background: #0F0E1A !important; }
    body[data-dark="1"] .bibo-content-card { background: #1A1830 !important; box-shadow: 0 4px 24px rgba(0,0,0,0.4) !important; color: #D0CFEE !important; }
    body[data-dark="1"] .bibo-content-card > div { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-table { background: #1A1830 !important; }
    body[data-dark="1"] .ant-table-thead > tr > th { background: #221F3D !important; color: #A09FD0 !important; }
    body[data-dark="1"] .ant-table-tbody > tr > td { background: #1A1830 !important; color: #D0CFEE !important; border-bottom: 1px solid #2D2A50 !important; }
    body[data-dark="1"] .ant-table-tbody > tr:hover > td { background: #221F3D !important; }
    body[data-dark="1"] .ant-btn { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-btn-primary { background: ${C.primary} !important; border-color: ${C.primary} !important; color: white !important; }
    body[data-dark="1"] .ant-input, body[data-dark="1"] .ant-input-affix-wrapper { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-select-selector { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-modal-content { background: #1A1830 !important; }
    body[data-dark="1"] .ant-modal-header { background: #1A1830 !important; border-bottom: 1px solid #2D2A50 !important; }
    body[data-dark="1"] .ant-modal-title { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-form-item-label > label { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-pagination-item { background: #221F3D !important; border-color: #3D3A6B !important; }
    body[data-dark="1"] .ant-pagination-item a { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-card { background: #1A1830 !important; border-color: #2D2A50 !important; }
    body[data-dark="1"] .ant-select-dropdown { background: #1A1830 !important; }
    body[data-dark="1"] .ant-select-item { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-select-item-option-selected { background: #221F3D !important; }
    body[data-dark="1"] .ant-pagination-item { background: #221F3D !important; border-color: #3D3A6B !important; }
    body[data-dark="1"] .ant-pagination-item a { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-pagination-item-active a { color: white !important; }
    body[data-dark="1"] .ant-pagination-prev button, body[data-dark="1"] .ant-pagination-next button { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-pagination-options { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-pagination-options-quick-jumper { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-pagination-options-quick-jumper input { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-pagination-total-text { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-select-selection-item { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-modal-content { background: #1A1830 !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-modal-header { background: #1A1830 !important; border-bottom: 1px solid #2D2A50 !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-modal-title { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-modal-close { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-modal-footer { background: #1A1830 !important; border-top: 1px solid #2D2A50 !important; }
    body[data-dark="1"] .ant-modal-wrap label { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-form-item-label > label { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-modal-wrap textarea { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-upload { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-switch { background: #3D3A6B !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-switch-checked { background: #6C63FF !important; }
    body[data-dark="1"] .ant-modal-wrap .ant-popover-inner { background: #1A1830 !important; }
    body[data-dark="1"] .ant-picker { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-picker input { background: transparent !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-picker-suffix { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-picker-separator { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-picker-panel-container { background: #1A1830 !important; }
    body[data-dark="1"] .ant-picker-panel { background: #1A1830 !important; border-color: #2D2A50 !important; }
    body[data-dark="1"] .ant-picker-header { background: #221F3D !important; border-bottom: 1px solid #2D2A50 !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-picker-header button { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-picker-content th { color: #A09FD0 !important; }
    body[data-dark="1"] .ant-picker-cell-in-view .ant-picker-cell-inner { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-picker-cell .ant-picker-cell-inner { color: #6B6A90 !important; }
    body[data-dark="1"] .prog-root { background: #0F0E1A !important; }
    body[data-dark="1"] .prog-filters { background: #1A1830 !important; box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important; }
    body[data-dark="1"] .prog-summary-card { background: #1A1830 !important; box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important; }
    body[data-dark="1"] .prog-summary-label { color: #7A79A0 !important; }
    body[data-dark="1"] .prog-card { background: #1A1830 !important; border-color: rgba(108,99,255,0.15) !important; }
    body[data-dark="1"] .prog-name { color: #D0CFEE !important; }
    body[data-dark="1"] .prog-meta { color: #7A79A0 !important; }
    body[data-dark="1"] .fb-dash .fb-filters { background: #1A1830 !important; }
    body[data-dark="1"] .fb-dash .fb-stat { background: #1A1830 !important; }
    body[data-dark="1"] .fb-dash .fb-card { background: #1A1830 !important; }
    body[data-dark="1"] .fb-dash .pq-card { background: #1A1830 !important; }
    body[data-dark="1"] .fb-dash .fb-card-title { color: #D0CFEE !important; }
    body[data-dark="1"] .fb-dash .fb-stat-lbl { color: #7A79A0 !important; }
    body[data-dark="1"] .fb-dash .ant-table-tbody > tr > td { background: #1A1830 !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-empty-description { color: #7A79A0 !important; }
    body[data-dark="1"] [style*="borderBottom:'1px solid #F0F2FF'"] { border-bottom-color: #2D2A50 !important; }
    body[data-dark="1"] [style*="border:'1px solid #F0F2FF'"] { border-color: #2D2A50 !important; }
    body[data-dark="1"] .ant-card-body { background: #1A1830 !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-statistic-title { color: #A09FD0 !important; }
    body[data-dark="1"] canvas { filter: brightness(0.9); }
    body[data-dark="1"] .ant-input-search .ant-input { background: #221F3D !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-input-search .ant-input-search-button { background: #3D3A6B !important; border-color: #3D3A6B !important; }
    body[data-dark="1"] .ant-popover-inner { background: #1A1830 !important; }
    body[data-dark="1"] .ant-popover-message { color: #D0CFEE !important; }
    body[data-dark="1"] .ant-tag { background: #221F3D !important; border-color: #3D3A6B !important; color: #D0CFEE !important; }
    body[data-dark="1"] .ant-spin-text { color: #A09FD0 !important; }
    body[data-dark="1"] p, body[data-dark="1"] span, body[data-dark="1"] div { scrollbar-color: #3D3A6B #1A1830; }
    .bibo-sider { background: ${C.sidebar} !important; }
    .bibo-sider .ant-layout-sider-children { display: flex; flex-direction: column; }
    .bibo-menu.ant-menu { background: transparent !important; border: none !important; flex: 1; }
    .bibo-menu .ant-menu-item { margin: 4px 12px !important; border-radius: 12px !important; color: rgba(255,255,255,0.65) !important; font-family: 'Plus Jakarta Sans', sans-serif !important; font-weight: 600 !important; font-size: 13px !important; height: 44px !important; line-height: 44px !important; transition: all 0.2s ease !important; }
    .bibo-menu .ant-menu-item:hover { background: ${C.sidebarHover} !important; color: white !important; }
    .bibo-menu .ant-menu-item-selected { background: ${C.sidebarActive} !important; color: white !important; box-shadow: 0 4px 15px rgba(108,99,255,0.35) !important; }
    .bibo-menu .ant-menu-item .ant-menu-item-icon { font-size: 16px !important; }
    .bibo-menu .ant-menu-item-danger { color: #FF6584 !important; }
    .bibo-menu .ant-menu-item-danger:hover { background: rgba(255,101,132,0.15) !important; }
    .bibo-content-card { background: white; border-radius: 20px; box-shadow: 0 4px 24px rgba(108,99,255,0.08); padding: 28px; min-height: calc(100vh - 140px); }
    .ant-table { font-family: 'Plus Jakarta Sans', sans-serif !important; border-radius: 14px !important; overflow: hidden; }
    .ant-table-thead > tr > th { background: linear-gradient(135deg, ${C.primary}11, ${C.accent}11) !important; font-weight: 700 !important; font-size: 12px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${C.primary} !important; border-bottom: 2px solid ${C.primary}22 !important; }
    .ant-table-tbody > tr > td { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: 13.5px !important; color: ${C.text} !important; border-bottom: 1px solid #F0F2FF !important; padding: 14px 16px !important; }
    .ant-table-tbody > tr:hover > td { background: ${C.primary}06 !important; }
    .ant-table-tbody > tr:last-child > td { border-bottom: none !important; }
    .ant-btn { font-family: 'Plus Jakarta Sans', sans-serif !important; font-weight: 600 !important; border-radius: 10px !important; transition: all 0.2s ease !important; }
    .ant-btn-primary { background: ${C.primary} !important; border-color: ${C.primary} !important; box-shadow: 0 4px 12px ${C.primary}44 !important; }
    .ant-btn-primary:hover { background: #5A52D5 !important; transform: translateY(-1px) !important; box-shadow: 0 6px 16px ${C.primary}55 !important; }
    .ant-btn-dangerous { border-radius: 10px !important; }
    .ant-btn-sm { border-radius: 8px !important; font-size: 12px !important; }
    .ant-input, .ant-input-affix-wrapper { border-radius: 10px !important; font-family: 'Plus Jakarta Sans', sans-serif !important; border-color: #E8E9FF !important; }
    .ant-input:focus, .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused { border-color: ${C.primary} !important; box-shadow: 0 0 0 3px ${C.primary}20 !important; }
    .ant-select-selector { border-radius: 10px !important; font-family: 'Plus Jakarta Sans', sans-serif !important; border-color: #E8E9FF !important; }
    .ant-pagination-item-active { background: ${C.primary} !important; border-color: ${C.primary} !important; }
    .ant-pagination-item-active a { color: white !important; }
    .ant-card { border-radius: 16px !important; border: 1px solid #F0F2FF !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .ant-card-head { font-family: 'Plus Jakarta Sans', sans-serif !important; font-weight: 700 !important; border-bottom: 1px solid #F0F2FF !important; }
    .ant-statistic-title { font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .ant-statistic-content-value { font-family: 'Plus Jakarta Sans', sans-serif !important; font-weight: 800 !important; }
    .ant-spin-dot-item { background: ${C.primary} !important; }
    .ant-tag { border-radius: 6px !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .ant-progress-bg { border-radius: 99px !important; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #F0F2FF; border-radius: 99px; }
    ::-webkit-scrollbar-thumb { background: ${C.primary}55; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.primary}; }
    .bibo-page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: ${C.text}; margin: 0; background: linear-gradient(135deg, ${C.primary}, ${C.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .bibo-page-subtitle { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: ${C.muted}; margin: 0; font-weight: 500; }
    .bibo-menu .ant-menu-item-selected::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 60%; background: ${C.accent}; border-radius: 0 4px 4px 0; }
    .bibo-menu .ant-menu-item { position: relative; }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .bibo-content-card { animation: fadeSlideIn 0.3s ease both; }
    @keyframes hsCardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .hs-nav-btn { background:white; border:1.5px solid #E8E9FF; border-radius:16px; padding:20px 16px; text-align:center; cursor:pointer; transition:all 0.2s ease; display:flex; flex-direction:column; align-items:center; gap:8px; }
    .hs-nav-btn:hover { border-color:${C.primary}; box-shadow:0 8px 24px ${C.primary}18; transform:translateY(-2px); }
    .hs-stat-card { background:white; border-radius:16px; padding:18px 20px; border:1.5px solid #E8E9FF; animation: hsCardIn 0.4s ease both; }
    .hs-info-card { background:white; border-radius:16px; padding:18px 20px; border:1.5px solid #E8E9FF; animation: hsCardIn 0.5s ease both; }
  `}</style>
);

const PAGE_META = {
  students:      { title: 'Students',    subtitle: 'Manage and monitor all registered students',           emoji: '👨‍🎓' },
  teachers:      { title: 'Teachers',    subtitle: 'Manage teacher accounts and access',                   emoji: '👩‍🏫' },
  quizzes:       { title: 'Quizzes',     subtitle: 'Create and manage reading quizzes',                    emoji: '📚' },
  'quiz-scores': { title: 'Quiz Scores', subtitle: 'Analytics, scores and student performance',            emoji: '📊' },
  progression:   { title: 'Progression', subtitle: 'Track student improvement from Pre-Test to Post-Test', emoji: '📈' },
  feedback:      { title: 'Feedback',    subtitle: 'See how students felt about each quiz',                emoji: '😊' },
};

const titleMap = {
  quizzes: "Quiz", "quiz-scores": "Quiz Attempt",
  students: "Student", teachers: "Teacher",
};

/* ── Homescreen component ─────────────────────────────────────────────────── */
const Homescreen = ({ authUser, onNavigate, darkMode, setDarkMode }) => {
  // ✅ CHANGE 1: Added kinder:0, grade1:0 to initial state
  const [stats,       setStats]       = useState({ total:0, active:0, locked:0, recentLogins:0, kinder:0, grade1:0 });
  const [topStudents, setTopStudents] = useState([]);
  const [needsHelp,   setNeedsHelp]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 17 ? 'Good afternoon' : 'Good evening';
  const name = authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || 'Teacher' : 'Teacher';

  const initials = authUser
    ? `${authUser.first_name?.[0] || ''}${authUser.last_name?.[0] || ''}`.toUpperCase()
    : 'A';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/students?all=true');
        const students = res.data?.data || [];
        const total  = students.length;
        const locked = students.filter(s => s.is_locked).length;
        const active = total - locked;

        const yesterday = new Date(Date.now() - 86400000);
        const recentLogins = students.filter(s =>
          s.updated_at && new Date(s.updated_at) > yesterday
        ).length;

        // ✅ CHANGE 2: Compute kinder and grade1 counts
        const kinder = students.filter(s => s.grade_level === 'Kinder').length;
        const grade1 = students.filter(s => s.grade_level === 'Grade 1').length;

        // ✅ CHANGE 3: Include kinder and grade1 in setStats
        setStats({ total, active, locked, recentLogins, kinder, grade1 });

        const attRes = await axios.get('/quiz-attempts?all=true');
        const attempts = attRes.data?.data || [];

        const scoreMap = {};
        for (const a of attempts) {
          const nick = a.student?.nickname;
          if (!nick || a.score == null) continue;
          if (!scoreMap[nick]) scoreMap[nick] = { scores:[], grade:a.student?.grade_level, section:a.student?.section };
          scoreMap[nick].scores.push(Number(a.score));
        }
        const avgScores = Object.entries(scoreMap).map(([nick, d]) => ({
          nickname: nick,
          grade: d.grade,
          section: d.section,
          avg: Math.round(d.scores.reduce((a,b)=>a+b,0) / d.scores.length),
        })).filter(s => s.avg > 0);

        avgScores.sort((a,b) => b.avg - a.avg);
        setTopStudents(avgScores.slice(0,3));
        setNeedsHelp(avgScores.slice(-3).reverse());
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const navItems = [
    { key:'students',    icon:'👨‍🎓', label:'Students',    sub:'Manage & monitor' },
    { key:'quizzes',     icon:'📚', label:'Quizzes',     sub:'Create & edit' },
    { key:'quiz-scores', icon:'📊', label:'Quiz Scores', sub:'Analytics & scores' },
    { key:'progression', icon:'📈', label:'Progression', sub:'Track improvement' },
    { key:'feedback',    icon:'😊', label:'Feedback',    sub:'Student responses' },
    { key:'teachers',    icon:'👩‍🏫', label:'Teachers',   sub:'Manage accounts' },
  ];

  // ✅ CHANGE 4: Added Total Kinder and Total Grade 1 cards
  const statCards = [
    { icon:'👨‍🎓', val:stats.total,        label:'Total students',   color:C.primary  },
    { icon:'✅',  val:stats.active,       label:'Active (unlocked)', color:'#15803D'  },
    { icon:'🔒',  val:stats.locked,       label:'Locked',            color:'#B91C1C'  },
    { icon:'🕐',  val:stats.recentLogins, label:'Recent logins',     color:'#854F0B'  },
    { icon:'🌱',  val:stats.kinder,       label:'Total Kinder',      color:'#0369A1'  },
    { icon:'📗',  val:stats.grade1,       label:'Total Grade 1',     color:'#7C3AED'  },
  ];

  return (
    <div style={{ minHeight:'100vh', background: darkMode ? 'linear-gradient(160deg, #0A091A 0%, #12102E 100%)' : 'linear-gradient(160deg, #1E1B4B 0%, #2D2A6E 100%)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── Full-width header ── */}
      <div style={{ padding:'20px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#6C63FF,#43D9AD)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:18, lineHeight:1 }}>BiboAI</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:2, textTransform:'uppercase' }}>Dashboard</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setDarkMode(d=>!d)} style={{ background:darkMode?'rgba(255,184,48,0.15)':'rgba(255,255,255,0.1)', border:`1.5px solid ${darkMode?'rgba(255,184,48,0.4)':'rgba(255,255,255,0.2)'}`, borderRadius:10, padding:'6px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:darkMode?'#FFB830':'rgba(255,255,255,0.8)' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Avatar size={38} style={{ background:'linear-gradient(135deg,#6C63FF,#FF6584)', fontWeight:700, fontSize:14 }}>{initials}</Avatar>
          <div>
            <div style={{ color:'white', fontSize:13, fontWeight:600, lineHeight:1 }}>{name}</div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:11 }}>Administrator</div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding:'32px 36px' }}>

        {/* Welcome */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ color:'white', fontWeight:800, fontSize:26, margin:'0 0 4px' }}>{greeting}, {name}! 👋</h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0 }}>Here's what's happening with your students today.</p>
        </div>

        {/* ✅ CHANGE 5: Grid changed from repeat(4,1fr) to repeat(6,1fr) to fit 6 cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14, marginBottom:28 }}>
          {loading ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40 }}><Spin size="large"/></div>
          ) : statCards.map((s,i) => (
            <div key={i} className="hs-stat-card" style={{ animationDelay:`${i*0.08}s`, background: darkMode?'#1A1830':'white', border: darkMode?'1.5px solid #2D2A50':'1.5px solid #E8E9FF' }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:12, color: darkMode?'#7A79A0':C.muted, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Go to</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
            {navItems.map((n,i) => (
              <div key={n.key} className="hs-nav-btn" style={{ animationDelay:`${i*0.06}s`, background: darkMode?'#1A1830':'white', border: darkMode?'1.5px solid #2D2A50':'1.5px solid #E8E9FF' }} onClick={() => onNavigate(n.key)}>
                <div style={{ fontSize:28 }}>{n.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color: darkMode?'#D0CFEE':C.text }}>{n.label}</div>
                <div style={{ fontSize:11, color:C.muted }}>{n.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:24 }}>
          {/* Top students */}
          <div className="hs-info-card" style={{ background: darkMode?'#1A1830':'white', border: darkMode?'1.5px solid #2D2A50':'1.5px solid #E8E9FF' }}>
            <div style={{ fontSize:13, fontWeight:700, color: darkMode?'#D0CFEE':C.text, marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
              🏆 <span>Top students</span>
            </div>
            {loading ? <Spin size="small"/> : topStudents.length === 0 ? (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:'12px 0' }}>No data yet</div>
            ) : topStudents.map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < topStudents.length-1 ? '0.5px solid #F0F2FF' : 'none' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:`${C.primary}18`, color:C.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {s.nickname.slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.nickname}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{s.grade} — Section {s.section}</div>
                </div>
                <div style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#EAF3DE', color:'#27500A', flexShrink:0 }}>{s.avg}%</div>
              </div>
            ))}
          </div>

          {/* Needs improvement */}
          <div className="hs-info-card" style={{ background: darkMode?'#1A1830':'white', border: darkMode?'1.5px solid #2D2A50':'1.5px solid #E8E9FF' }}>
            <div style={{ fontSize:13, fontWeight:700, color: darkMode?'#D0CFEE':C.text, marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
              ⚠️ <span>Needs improvement</span>
            </div>
            {loading ? <Spin size="small"/> : needsHelp.length === 0 ? (
              <div style={{ fontSize:12, color:C.muted, textAlign:'center', padding:'12px 0' }}>No data yet</div>
            ) : needsHelp.map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < needsHelp.length-1 ? '0.5px solid #F0F2FF' : 'none' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'#FCEBEB', color:'#A32D2D', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {s.nickname.slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.nickname}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{s.grade} — Section {s.section}</div>
                </div>
                <div style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background: s.avg >= 40 ? '#FAEEDA' : '#FCEBEB', color: s.avg >= 40 ? '#633806' : '#A32D2D', flexShrink:0 }}>{s.avg}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [showHome,      setShowHome]      = useState(true);
  const [collapsed,     setCollapsed]     = useState(false);
  const [darkMode,      setDarkMode]      = useState(() => localStorage.getItem('bibo_dark') === 'true');
  const [notifications, setNotifications] = useState([]);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [lastSeen,      setLastSeen]      = useState(() => localStorage.getItem('bibo_notif_seen') || new Date(0).toISOString());
  const [selectedKeys,  setSelectedKeys]  = useState(['students']);
  const [endpoint,      setEndpoint]      = useState('/students');
  const [showCreate,    setShowCreate]    = useState(false);
  const [showView,      setShowView]      = useState(true);
  const [showEdit,      setShowEdit]      = useState(true);
  const [showDelete,    setShowDelete]    = useState(true);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [pageSize,      setPageSize]      = useState(10);
  const [pagination,    setPagination]    = useState(null);
  const [items,         setItems]         = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading,       setLoading]       = useState(false);

  const { authUser, logout, getUser } = useAuth();
  const { store, update, destroy, show } = useApi(endpoint);

  useEffect(() => { getUser(); }, []);

  useEffect(() => { localStorage.setItem('bibo_dark', darkMode); }, [darkMode]);

  useEffect(() => {
    document.body.style.background = darkMode ? '#0F0E1A' : '#F0F2FF';
    document.body.setAttribute('data-dark', darkMode ? '1' : '0');
  }, [darkMode]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('/notifications');
        const data = res.data?.data || [];
        setNotifications(data);
        const newCount = data.filter(n => n.time > lastSeen).length;
        setUnreadCount(newCount);
      } catch(e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  const handleOpenNotif = () => {
    setNotifOpen(o => !o);
    if (!notifOpen) {
      const now = new Date().toISOString();
      setLastSeen(now);
      localStorage.setItem('bibo_notif_seen', now);
      setUnreadCount(0);
    }
  };

  const fetchData = async (page = 1, size = 10) => {
    if (!endpoint) return;
    setLoading(true);
    try {
      const isQuizScores = endpoint === '/quiz-attempts';
      const isStudents   = endpoint === '/students';
      const url = (isQuizScores || isStudents) ? `${endpoint}?all=true` : `${endpoint}?page=${page}&per_page=${size}`;
      const response = await axios.get(url);
      if (response.data.data) {
        const d = response.data.data;
        if (d.data && Array.isArray(d.data)) {
          setItems(d.data);
          setPagination({ current_page: d.current_page, total: d.total, per_page: d.per_page, from: d.from, to: d.to, last_page: d.last_page });
        } else if (Array.isArray(d)) {
          setItems(d); setPagination(null);
        } else { setItems([d]); setPagination(null); }
      } else { setItems([]); setPagination(null); }
    } catch(e) { console.error(e); setItems([]); setPagination(null); }
    finally { setLoading(false); }
  };

  const handlePageChange     = (p)        => setCurrentPage(p);
  const handlePageSizeChange = (s, p = 1) => { setPageSize(s); setCurrentPage(p); };
  useEffect(() => { if (endpoint) fetchData(currentPage, pageSize); }, [endpoint, currentPage, pageSize]);

  const getQuestionTypeOptions = async () => {
    try {
      const r = await axios.get('/question-types', { params: { all: true } });
      setQuestionTypes(r.data.data.map(i => ({ label: i.label, value: i.id })));
    } catch { setQuestionTypes([]); }
  };

  useEffect(() => {
    const k = selectedKeys[0];
    setCurrentPage(1); setPageSize(10); setPagination(null); setItems([]); setFilteredItems([]);
    switch(k) {
      case "students":    setEndpoint("/students");      setShowCreate(false); setShowView(true);  setShowEdit(true);  setShowDelete(true);  break;
      case "teachers":    setEndpoint("/users");         setShowCreate(true);  setShowView(true);  setShowEdit(true);  setShowDelete(true);  break;
      case "quizzes":     setEndpoint("/quizzes");       setShowCreate(true);  setShowView(true);  setShowEdit(true);  setShowDelete(true);  getQuestionTypeOptions(); break;
      case "quiz-scores": setEndpoint("/quiz-attempts"); setShowCreate(false); setShowView(true);  setShowEdit(false); setShowDelete(false); break;
      case "progression": setEndpoint(""); break;
      case "feedback":    setEndpoint(""); break;
      default: setEndpoint("");
    }
  }, [selectedKeys]);

  const menuItems = [
    { key:'home',        icon:<HomeOutlined />,         label:'Home' },
    { key:'students',    icon:<UserOutlined />,          label:'Students' },
    { key:'teachers',    icon:<TeamOutlined />,          label:'Teachers' },
    { key:'quizzes',     icon:<BookOutlined />,          label:'Quizzes' },
    { key:'quiz-scores', icon:<BarChartOutlined />,      label:'Quiz Scores' },
    { key:'progression', icon:<LineChartOutlined />,     label:'Progression' },
    { key:'feedback',    icon:<SmileOutlined />,         label:'Feedback' },
    { type:'divider' },
    { key:'logout',      icon:<LogoutOutlined />,        label:'Logout', danger:true },
  ];

  const getFieldsConfig = (type) => {
    switch(type) {
      case 'students': return [
        { name:'nickname',    label:'Nickname',    required:true },
        { name:'grade_level', label:'Grade Level', type:'select', options:[{ value:'Kinder', label:'Kinder' },{ value:'Grade 1', label:'Grade 1' }], required:true },
        { name:'section',     label:'Section',     type:'select', options:['1','2','3','4'].map(v=>({ value:v, label:v })), required:true },
      ];
      case 'teachers': return [
        { name:'username',   label:'Username',   required:true },
        { name:'first_name', label:'First Name', required:true },
        { name:'last_name',  label:'Last Name',  required:true },
      ];
      case 'quizzes': return [
        { name:'title',        label:'Title',        required:true },
        { name:'instructions', label:'Instructions', type:'textarea' },
        { name:'grade_level',  label:'Grade Level',  type:'select', options:[{ value:'Kinder', label:'Kinder' },{ value:'Grade 1', label:'Grade 1' }], required:true },
        { name:'difficulty',   label:'Difficulty',   type:'select', options:[
          { value:'Introduction', label:'Pre-Test' },{ value:'Easy', label:'Low Reader' },
          { value:'Medium', label:'Developing Reader' },{ value:'Hard', label:'Grade Ready Reader' },
          { value:'Expert', label:'Advanced Reader' },{ value:'PostTest', label:'Post-Test' },
        ], required:true },
        { name:'time_limit', label:'Time Limit (minutes)', type:'number' },
      ];
      case 'quiz-scores': return [
        { name:'quiz.title',          label:'Quiz Title' },
        { name:'student.nickname',    label:'Student Name' },
        { name:'student.section',     label:'Section' },
        { name:'student.grade_level', label:'Grade Level' },
        { name:'score',               label:'Score' },
      ];
      default: return [];
    }
  };

  const getColumnsConfig = (type) => {
    switch(type) {
      case 'students': return [
        { title:'Nickname',    dataIndex:'nickname',    key:'nickname' },
        { title:'Grade Level', dataIndex:'grade_level', key:'grade_level', render:v=><span style={{ background:v==='Kinder'?'#E8F5E9':'#E3F2FD', color:v==='Kinder'?'#2E7D32':'#1565C0', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>{v}</span> },
        { title:'Section',     dataIndex:'section',     key:'section',     render:v=><span style={{ background:'#F3E5F5', color:'#6A1B9A', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>Section {v}</span> },
        { title:'Status',      dataIndex:'is_locked',   key:'is_locked',   render:v=>v
          ? <span style={{ background:'#FFEBEE', color:'#C62828', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>🔒 Locked</span>
          : <span style={{ background:'#E8F5E9', color:'#2E7D32', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>✅ Active</span> },
      ];
      case 'teachers': return [
        { title:'Username',   dataIndex:'username',   key:'username' },
        { title:'First Name', dataIndex:'first_name', key:'first_name' },
        { title:'Last Name',  dataIndex:'last_name',  key:'last_name' },
      ];
      case 'quizzes': return [
        { title:'Title',      dataIndex:'title',      key:'title',      render:v=><span style={{ fontWeight:700 }}>{v}</span> },
        { title:'Grade Level',dataIndex:'grade_level',key:'grade_level' },
        { title:'Difficulty', dataIndex:'difficulty', key:'difficulty' },
        { title:'Time Limit', dataIndex:'time_limit', key:'time_limit', render:v=>`${v} min` },
        { title:'Active',     dataIndex:'is_active',  key:'is_active',  render:v=>v
          ? <span style={{ background:'#E8F5E9', color:'#2E7D32', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>✓ Active</span>
          : <span style={{ background:'#FFEBEE', color:'#C62828', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>✗ Hidden</span> },
        { title:'Questions',  dataIndex:'questions',  key:'questions',  render:q=><span style={{ fontWeight:700, color:C.primary }}>{q?.length||0} Qs</span> },
      ];
      case 'quiz-scores': return [
        { title:'Quiz Title',  key:'quiz_title',  render:(_,r)=><span style={{ fontWeight:600 }}>{r.quiz?.title||'N/A'}</span> },
        { title:'Student',     key:'student_name',render:(_,r)=>r.student?.nickname||'N/A' },
        { title:'Section',     key:'section',     render:(_,r)=>r.student?.section||'N/A' },
        { title:'Grade Level', key:'grade_level', render:(_,r)=>r.student?.grade_level||'N/A' },
        { title:'Score',       dataIndex:'score', key:'score', render:v=><span style={{ fontWeight:700, color:C.primary }}>{v}</span> },
      ];
      default: return [];
    }
  };

  const handleLockToggle = async (record, lock) => {
    try { await axios.patch(`/students/${record.id}/${lock?'lock':'unlock'}`); await fetchData(currentPage, pageSize); }
    catch(e) { console.error(e); }
  };

  const handleCreate = async (fd) => {
    try {
      const { id, ...data } = fd;
      if (selectedKeys[0]==='quizzes' && data.questions) {
        data.questions = data.questions.map(q => ({ question_text:q.question_text, question_type_id:q.question_type_id, points:parseInt(q.points)||1, choices:q.choices?.map(c=>({ choice_text:c.choice_text, is_correct:c.is_correct||false }))||[] }));
      }
      await store(data); await fetchData(currentPage, pageSize);
    } catch(e) { console.error(e); throw e; }
  };

  const handleUpdate = async (fd) => {
    try {
      let id;
      if (fd instanceof FormData) {
        id = fd.get('id'); if (!id) throw new Error('ID required');
        await update(id, fd);
      } else {
        id = fd.id; if (!id) throw new Error('ID required');
        const { id:_, ...data } = fd;
        if (selectedKeys[0]==='quizzes' && data.questions) {
          data.questions = data.questions.map(q => ({ id:q.id, question_text:q.question_text, question_type_id:q.question_type_id, points:parseInt(q.points)||1, photo:q.photo||null, choices:q.choices?.map(c=>({ id:c.id, choice_text:c.choice_text, is_correct:c.is_correct||false }))||[] }));
        }
        await update(id, data);
      }
      await fetchData(currentPage, pageSize);
    } catch(e) { console.error(e); throw e; }
  };

  const handleDelete = async (record) => {
    try {
      if (!record.id) throw new Error('ID required');
      await destroy(record.id);
      const newTotal = pagination ? pagination.total-1 : items.length-1;
      const maxPage  = Math.ceil(newTotal/pageSize);
      const target   = currentPage > maxPage ? maxPage : currentPage;
      await fetchData(target||1, pageSize);
      if (target !== currentPage) setCurrentPage(target||1);
    } catch(e) { console.error(e); throw e; }
  };

  const handleView = async (record) => {
    try {
      if (selectedKeys[0]==='quizzes' && show && record.id) return await show(record.id);
      return record;
    } catch(e) { return record; }
  };

  const handleMenuClick = async ({ key }) => {
    if (key==='logout') await logout();
    else if (key==='home') { setShowHome(true); }
    else { setShowHome(false); setSelectedKeys([key]); }
  };

  const handleHomescreenNavigate = (key) => {
    setShowHome(false);
    setSelectedKeys([key]);
  };

  const activeKey = selectedKeys[0];
  const meta = PAGE_META[activeKey] || { title:'Dashboard', subtitle:'', emoji:'🏠' };
  const initials = authUser ? `${authUser.first_name?.[0]||''}${authUser.last_name?.[0]||''}`.toUpperCase() : 'A';

  const renderContent = () => {
    if (activeKey==='feedback') return (
      <div className="bibo-content-card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F2FF', background:'linear-gradient(135deg,#6C63FF08,#43D9AD08)' }}>
          <div style={{ fontWeight:800, fontSize:16, color:'#1A1A2E' }}>😊 Student Feedback</div>
          <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>See how students felt about each quiz</div>
        </div>
        <div style={{ padding:20 }}><FeedbackDashboard /></div>
      </div>
    );

    if (activeKey==='progression') return (
      <div className="bibo-content-card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F2FF', background:'linear-gradient(135deg,#6C63FF08,#43D9AD08)' }}>
          <div style={{ fontWeight:800, fontSize:16, color:'#1A1A2E' }}>📈 Student Progression</div>
          <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>Track each student's improvement from Pre-Test to Post-Test</div>
        </div>
        <div style={{ padding:20 }}><StudentProgression /></div>
      </div>
    );

    if (activeKey==='quiz-scores') {
      const tableData = filteredItems.length>0||items.length===0 ? filteredItems : items;
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <LMSAnalyticsDashboard data={items} onFilterChange={setFilteredItems} />
          <div className="bibo-content-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F2FF', background:'linear-gradient(135deg,#6C63FF08,#43D9AD08)' }}>
              <div style={{ fontWeight:800, fontSize:16, color:C.text }}>📋 Quiz Attempts List</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Showing {tableData.length} filtered records</div>
            </div>
            <div style={{ padding:20 }}>
              <DataTable
                title={titleMap[activeKey]} data={tableData} loading={loading}
                columns={getColumnsConfig(activeKey)} fields={getFieldsConfig(activeKey)}
                onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} onView={handleView}
                showCreate={false} showView={showView} showEdit={false} showDelete={false}
                authUser={authUser} questionTypeOptions={questionTypes}
                localPagination={{ pageSize:10, showSizeChanger:true, showQuickJumper:true, showTotal:(t,r)=>`${r[0]}-${r[1]} of ${t} items`, pageSizeOptions:['10','20','50','100'] }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (['students','teachers','quizzes'].includes(activeKey)) return (
      <div className="bibo-content-card">
        <DataTable
          title={titleMap[activeKey]} data={items} loading={loading}
          columns={getColumnsConfig(activeKey)} fields={getFieldsConfig(activeKey)}
          onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} onView={handleView}
          showCreate={showCreate} showView={showView} showEdit={showEdit} showDelete={showDelete}
          authUser={authUser} questionTypeOptions={questionTypes}
          pagination={activeKey==='students'?null:pagination}
          onPageChange={activeKey==='students'?null:handlePageChange}
          onPageSizeChange={activeKey==='students'?null:handlePageSizeChange}
          localPagination={activeKey==='students'?{ pageSize:10, showSizeChanger:true, showQuickJumper:true, showTotal:(t,r)=>`${r[0]}-${r[1]} of ${t} items`, pageSizeOptions:['10','20','50','100'] }:null}
          showSearch={activeKey==='students'}
          onLockToggle={activeKey==='students'?handleLockToggle:null}
        />
      </div>
    );

    return (
      <div className="bibo-content-card" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>📖</div>
          <div style={{ fontWeight:800, fontSize:20, color:C.text }}>Welcome to BiboAI Dashboard</div>
          <div style={{ color:C.muted, marginTop:8 }}>Select a section from the sidebar to get started.</div>
        </div>
      </div>
    );
  };

  if (showHome) return (
    <>
      <GlobalStyle dark={darkMode} />
      <Homescreen authUser={authUser} onNavigate={handleHomescreenNavigate} darkMode={darkMode} setDarkMode={setDarkMode} />
    </>
  );

  return (
    <>
      <GlobalStyle dark={darkMode} />
      <Layout style={{ minHeight:'100vh', minWidth:'100vw', background: darkMode?'#0F0E1A':C.bg }}>
        <Sider className="bibo-sider" trigger={null} collapsible collapsed={collapsed} width={230} collapsedWidth={72}
          style={{ position:'fixed', left:0, top:0, bottom:0, zIndex:100, overflow:'hidden' }}>
          <div style={{ padding:collapsed?'20px 0':'20px 20px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:8, justifyContent:collapsed?'center':'flex-start' }}>
            <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#6C63FF,#43D9AD)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 4px 12px rgba(108,99,255,0.4)', cursor:'pointer' }} onClick={()=>setShowHome(true)}>🤖</div>
            {!collapsed && (
              <div style={{ cursor:'pointer' }} onClick={()=>setShowHome(true)}>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:16, color:'white', lineHeight:1 }}>BiboAI</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2, textTransform:'uppercase' }}>Dashboard</div>
              </div>
            )}
          </div>

          {!collapsed && authUser && (
            <div style={{ margin:'0 12px 8px', padding:'10px 12px', background:'rgba(255,255,255,0.06)', borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
              <Avatar size={34} style={{ background:'linear-gradient(135deg,#6C63FF,#FF6584)', fontWeight:700, fontSize:13, flexShrink:0 }}>{initials}</Avatar>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:12, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{authUser.first_name} {authUser.last_name}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.45)' }}>Administrator</div>
              </div>
            </div>
          )}
          {collapsed && authUser && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
              <Avatar size={34} style={{ background:'linear-gradient(135deg,#6C63FF,#FF6584)', fontWeight:700, fontSize:13 }}>{initials}</Avatar>
            </div>
          )}

          <Menu className="bibo-menu" mode="inline" selectedKeys={selectedKeys} onClick={handleMenuClick} items={menuItems} inlineCollapsed={collapsed} />

          <div style={{ padding:12, borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:'auto' }}>
            <Button type="text" icon={collapsed?<MenuUnfoldOutlined/>:<MenuFoldOutlined/>} onClick={()=>setCollapsed(!collapsed)}
              style={{ width:'100%', color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.06)', borderRadius:10, border:'none', height:38 }} />
          </div>
        </Sider>

        <Layout style={{ marginLeft:collapsed?72:230, transition:'margin-left 0.2s ease', background:C.bg }}>
          <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(240,242,255,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(108,99,255,0.1)', padding:'0 28px', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#6C63FF22,#43D9AD22)', border:'1px solid #6C63FF22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{meta.emoji}</div>
              <div>
                <div className="bibo-page-title">{meta.title}</div>
                <div className="bibo-page-subtitle">{meta.subtitle}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative' }}>
              <button onClick={()=>setShowHome(true)} style={{ background:darkMode?'rgba(108,99,255,0.15)':'rgba(108,99,255,0.1)', border:'1.5px solid rgba(108,99,255,0.2)', borderRadius:10, padding:'6px 14px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.primary, display:'flex', alignItems:'center', gap:6 }}>
                🏠 Home
              </button>

              <button onClick={()=>setDarkMode(d=>!d)} style={{ background:darkMode?'rgba(255,184,48,0.15)':'rgba(108,99,255,0.1)', border:`1.5px solid ${darkMode?'rgba(255,184,48,0.4)':'rgba(108,99,255,0.2)'}`, borderRadius:10, padding:'6px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:darkMode?'#FFB830':C.primary }}>
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>

              <div style={{ position:'relative' }}>
                <button onClick={handleOpenNotif} style={{ background:notifOpen?'rgba(108,99,255,0.2)':'rgba(108,99,255,0.1)', border:'1.5px solid rgba(108,99,255,0.2)', borderRadius:10, padding:'6px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.primary }}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ background:'#FF6584', color:'white', borderRadius:99, fontSize:10, fontWeight:800, padding:'0px 5px', minWidth:16, textAlign:'center', lineHeight:'16px' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:340, background:darkMode?'#1A1830':'white', border:`1px solid ${darkMode?'#2D2A50':'#E8E9FF'}`, borderRadius:16, boxShadow:'0 12px 40px rgba(0,0,0,0.18)', zIndex:1000, overflow:'hidden' }}>
                    <div style={{ padding:'14px 16px', borderBottom:`1px solid ${darkMode?'#2D2A50':'#F0F2FF'}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontWeight:700, fontSize:14, color:darkMode?'#D0CFEE':C.text }}>🔔 Notifications</span>
                      <span style={{ fontSize:11, color:C.muted }}>Last 30 min</span>
                    </div>
                    <div style={{ maxHeight:360, overflowY:'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding:'28px 16px', textAlign:'center', color:C.muted, fontSize:13 }}>
                          <div style={{ fontSize:32, marginBottom:8 }}>🔕</div>
                          No recent notifications
                        </div>
                      ) : notifications.map((n, i) => (
                        <div key={n.id} style={{ padding:'12px 16px', borderBottom:`0.5px solid ${darkMode?'#2D2A50':'#F0F2FF'}`, display:'flex', gap:10, alignItems:'flex-start', background:i%2===0?(darkMode?'#1A1830':'white'):(darkMode?'#1E1C35':'#FAFBFF') }}>
                          <div style={{ width:32, height:32, borderRadius:10, background:`${n.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                            {n.icon}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:darkMode?'#D0CFEE':C.text, marginBottom:2 }}>{n.title}</div>
                            <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{n.message}</div>
                            <div style={{ fontSize:10, color:`${C.muted}88`, marginTop:4 }}>
                              {new Date(n.time).toLocaleTimeString('en-PH',{ hour:'2-digit', minute:'2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding:'10px 16px', borderTop:`1px solid ${darkMode?'#2D2A50':'#F0F2FF'}`, textAlign:'center', fontSize:11, color:C.muted }}>
                      Updates every 15 seconds
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding:'6px 14px', borderRadius:10, background:'linear-gradient(135deg,#6C63FF,#43D9AD)', color:'white', fontSize:12, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>🤖 BiboAI</div>
            </div>
          </div>

          <Content style={{ padding:24, minHeight:'calc(100vh - 72px)', background: darkMode?'#0F0E1A':C.bg }}>
            <Spin spinning={loading} tip="Loading..." style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {renderContent()}
            </Spin>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Dashboard;
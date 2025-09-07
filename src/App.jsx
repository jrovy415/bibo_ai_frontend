import { ConfigProvider } from 'antd';
import Router from '../routes/routes'
import 'antd/dist/reset.css';

const App = () => {
  return (
    <ConfigProvider>
      <Router />
    </ConfigProvider>
  )
};

export default App;
import { ConfigProvider } from 'antd';
import Router from '../routes/routes'
import 'antd/dist/reset.css';

const rootStyle = `
  #root {
    min-height: 100vh;
    height: auto !important;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    max-width: 100%;
    display: block !important;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: auto;
    overflow-x: hidden;
  }
`;

const App = () => {
  return (
    <>
      <style>{rootStyle}</style>
      <ConfigProvider>
        <Router />
      </ConfigProvider>
    </>
  )
};

export default App;

import App from './App';
import ContextProvider from './context/ContextProvider';
import ReactDOM from 'react-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ContextProvider>
    <App />
  </ContextProvider>
);





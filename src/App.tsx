import React from 'react';
import styles from './App.module.css';
import EmailInput from 'components/EmailInput';

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
  return (
    <div className={styles.appContainer}>
      <EmailInput />
    </div>
  );
};

export default App;

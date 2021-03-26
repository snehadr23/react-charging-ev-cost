import './App.css';
import './params/styles/params.css'
import Params from './params/params';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Check if your current electric rate is best for your EV
        </p>
      </header>
      <div className = 'data'>
        <div className = 'params'>
          <Params/>
        </div>
        <div className = 'findings'>
        Findings here
        </div>
      </div>
      
    </div>
  );
}

export default App;

import './App.css';
import './components/params/styles/params.css'
import Params from './components/params/params';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Check if your current electric rate is best for your EV charging needs
        </p>
      </header>
      <div className = 'data'>
        <Params/>
      </div>
      <div>
        <a className = 'git-repo' target = '_blank' href = 'https://github.com/snehadr23/react-charging-ev-cost'>
          <img src = 'GitHub-Mark-Light-32px.png'/>
        </a>
      </div>
      
    </div>
  );
}

export default App;

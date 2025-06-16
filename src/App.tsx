import Game from './components/Game'
import './App.css'
import GameInterface from './components/GameInterface'

function App() {
  return (
    <div className="App">
      <GameInterface />
      <Game onDebugToggle={() => {}} />
    </div>
  )
}

export default App

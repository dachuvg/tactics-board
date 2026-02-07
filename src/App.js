import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import PitchCanvas from './components/PitchCanvas';
// import ImageUpload from './components/ImageUpload';
import Footer from './components/Footer';


// Helper function to create player with defaults
// facing: direction player is oriented in radians (Team A defaults to 0, Team B to Math.PI)
const createPlayer = (x, y, number = null, name = '', isGK = false, facing = 0) => ({
  x,
  y,
  number,
  name,
  isGK,
  facing,
});

// Formation presets
const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2',
    playersA: [
      createPlayer(-48, 0, null, '', true, 0),  // GK
      createPlayer(-35, -25, null, '', false, 0), // LB
      createPlayer(-35, -10, null, '', false, 0), // CB
      createPlayer(-35, 10, null, '', false, 0),  // CB
      createPlayer(-35, 25, null, '', false, 0),  // RB
      createPlayer(-20, -20, null, '', false, 0), // LM
      createPlayer(-20, -5, null, '', false, 0),  // CM
      createPlayer(-20, 5, null, '', false, 0),   // CM
      createPlayer(-20, 20, null, '', false, 0),  // RM
      createPlayer(-5, -10, null, '', false, 0),  // ST
      createPlayer(-5, 10, null, '', false, 0),   // ST
    ],
    playersB: [
      createPlayer(48, 0, null, '', true, Math.PI),   // GK
      createPlayer(35, -25, null, '', false, Math.PI), // LB
      createPlayer(35, -10, null, '', false, Math.PI), // CB
      createPlayer(35, 10, null, '', false, Math.PI),  // CB
      createPlayer(35, 25, null, '', false, Math.PI),  // RB
      createPlayer(20, -20, null, '', false, Math.PI), // LM
      createPlayer(20, -5, null, '', false, Math.PI),  // CM
      createPlayer(20, 5, null, '', false, Math.PI),   // CM
      createPlayer(20, 20, null, '', false, Math.PI),  // RM
      createPlayer(5, -10, null, '', false, Math.PI),  // ST
      createPlayer(5, 10, null, '', false, Math.PI),   // ST
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    playersA: [
      createPlayer(-48, 0, null, '', true, 0),  // GK
      createPlayer(-35, -25, null, '', false, 0), // LB
      createPlayer(-35, -10, null, '', false, 0), // CB
      createPlayer(-35, 10, null, '', false, 0),  // CB
      createPlayer(-35, 25, null, '', false, 0),  // RB
      createPlayer(-20, -15, null, '', false, 0), // LM
      createPlayer(-20, 0, null, '', false, 0),   // CM
      createPlayer(-20, 15, null, '', false, 0),  // RM
      createPlayer(-5, -20, null, '', false, 0),  // LW
      createPlayer(-5, 0, null, '', false, 0),    // ST
      createPlayer(-5, 20, null, '', false, 0),   // RW
    ],
    playersB: [
      createPlayer(48, 0, null, '', true, Math.PI),   // GK
      createPlayer(35, -25, null, '', false, Math.PI), // LB
      createPlayer(35, -10, null, '', false, Math.PI), // CB
      createPlayer(35, 10, null, '', false, Math.PI),  // CB
      createPlayer(35, 25, null, '', false, Math.PI),  // RB
      createPlayer(20, -15, null, '', false, Math.PI), // LM
      createPlayer(20, 0, null, '', false, Math.PI),   // CM
      createPlayer(20, 15, null, '', false, Math.PI),  // RM
      createPlayer(5, -20, null, '', false, Math.PI),  // LW
      createPlayer(5, 0, null, '', false, Math.PI),    // ST
      createPlayer(5, 20, null, '', false, Math.PI),   // RW
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    playersA: [
      createPlayer(-48, 0, null, '', true, 0),  // GK
      createPlayer(-35, -15, null, '', false, 0), // CB
      createPlayer(-35, 0, null, '', false, 0),   // CB
      createPlayer(-35, 15, null, '', false, 0),  // CB
      createPlayer(-20, -25, null, '', false, 0), // LWB
      createPlayer(-20, -10, null, '', false, 0), // LM
      createPlayer(-20, 0, null, '', false, 0),   // CM
      createPlayer(-20, 10, null, '', false, 0),  // RM
      createPlayer(-20, 25, null, '', false, 0),  // RWB
      createPlayer(-5, -10, null, '', false, 0),  // ST
      createPlayer(-5, 10, null, '', false, 0),   // ST
    ],
    playersB: [
      createPlayer(48, 0, null, '', true, Math.PI),   // GK
      createPlayer(35, -15, null, '', false, Math.PI), // CB
      createPlayer(35, 0, null, '', false, Math.PI),   // CB
      createPlayer(35, 15, null, '', false, Math.PI),  // CB
      createPlayer(20, -25, null, '', false, Math.PI), // LWB
      createPlayer(20, -10, null, '', false, Math.PI), // LM
      createPlayer(20, 0, null, '', false, Math.PI),   // CM
      createPlayer(20, 10, null, '', false, Math.PI),  // RM
      createPlayer(20, 25, null, '', false, Math.PI),  // RWB
      createPlayer(5, -10, null, '', false, Math.PI),  // ST
      createPlayer(5, 10, null, '', false, Math.PI),   // ST
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    playersA: [
      createPlayer(-48, 0, null, '', true, 0),  // GK
      createPlayer(-35, -25, null, '', false, 0), // LB
      createPlayer(-35, -10, null, '', false, 0), // CB
      createPlayer(-35, 10, null, '', false, 0),  // CB
      createPlayer(-35, 25, null, '', false, 0),  // RB
      createPlayer(-20, -5, null, '', false, 0),  // CDM
      createPlayer(-20, 5, null, '', false, 0),   // CDM
      createPlayer(-5, -20, null, '', false, 0),  // LW
      createPlayer(-5, 0, null, '', false, 0),    // CAM
      createPlayer(-5, 20, null, '', false, 0),   // RW
      createPlayer(5, 0, null, '', false, 0),     // ST
    ],
    playersB: [
      createPlayer(48, 0, null, '', true, Math.PI),   // GK
      createPlayer(35, -25, null, '', false, Math.PI), // LB
      createPlayer(35, -10, null, '', false, Math.PI), // CB
      createPlayer(35, 10, null, '', false, Math.PI),  // CB
      createPlayer(35, 25, null, '', false, Math.PI),  // RB
      createPlayer(20, -5, null, '', false, Math.PI),  // CDM
      createPlayer(20, 5, null, '', false, Math.PI),   // CDM
      createPlayer(5, -20, null, '', false, Math.PI),  // LW
      createPlayer(5, 0, null, '', false, Math.PI),    // CAM
      createPlayer(5, 20, null, '', false, Math.PI),   // RW
      createPlayer(-5, 0, null, '', false, Math.PI),   // ST
    ]
  }
};

const DEFAULT_FORMATION = '4-4-2';

function App() {
  const pitchRef = useRef(null);
  const [currentFormation, setCurrentFormation] = useState(DEFAULT_FORMATION);
  const [homeColor, setHomeColor] = useState('#0300C2');
  const [awayColor, setAwayColor] = useState('#ef4444');


  const [playersA, setPlayersA] = useState(
    FORMATIONS[DEFAULT_FORMATION].playersA.map(p => ({ 
      ...p, 
      number: p.number !== undefined ? p.number : null, 
      name: p.name || '' 
    }))
  );
  const [playersB, setPlayersB] = useState(
    FORMATIONS[DEFAULT_FORMATION].playersB.map(p => ({ 
      ...p, 
      number: p.number !== undefined ? p.number : null, 
      name: p.name || '' 
    }))
  );
  const [modelType, setModelType] = useState('control'); // 'control' or 'xg'
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [playerSpeed, setPlayerSpeed] = useState(5.0);
  const [reactionTime, setReactionTime] = useState(0.7);
  const [tau, setTau] = useState(0.5);
  const [editingPlayer, setEditingPlayer] = useState(null); // { team: 'A'|'B', index: number }

  const handlePlayerDrag = useCallback((team, index, newPos) => {
    if (team === 'A') {
      setPlayersA(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...newPos };
        return updated;
      });
    } else {
      setPlayersB(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...newPos };
        return updated;
      });
    }
  }, []);

  const handlePlayerDoubleClick = useCallback((team, index) => {
    setEditingPlayer({ team, index });
  }, []);

  const handlePlayerUpdate = useCallback((team, index, number, name) => {
    if (team === 'A') {
      setPlayersA(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], number, name };
        return updated;
      });
    } else {
      setPlayersB(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], number, name };
        return updated;
      });
    }
    setEditingPlayer(null);
  }, []);

  const handleBallMove = useCallback((newPos) => {
    setBallPosition(newPos);
  }, []);

  const handlePlayersDetected = useCallback((teamA, teamB, ballPos) => {
    setPlayersA(teamA);
    setPlayersB(teamB);
    if (ballPos) {
      setBallPosition(ballPos);
    }
  }, []);

  const handleFormationChange = (formationName) => {
    const formation = FORMATIONS[formationName];
    if (formation) {
      setCurrentFormation(formationName);
      setPlayersA(formation.playersA.map(p => ({ ...p, number: p.number || null, name: p.name || '' })));
      setPlayersB(formation.playersB.map(p => ({ ...p, number: p.number || null, name: p.name || '' })));
      setBallPosition({ x: 0, y: 0 });
    }
  };

  const resetFormation = () => {
    handleFormationChange(currentFormation);
  };

  const exportAsImage = () => {
    const canvas = pitchRef.current?.getCanvas?.();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const ts = new Date().toISOString().replaceAll(':', '-');
    link.href = dataUrl;
    link.download = `tactics-board-${modelType}-${ts}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>⚽ Tactics Board - Pitch Control & xG Analysis</h1>
        <div className="controls">
          <div className="model-selector">
            <button
              className={modelType === 'control' ? 'active' : ''}
              onClick={() => setModelType('control')}
            >
              Model 1: Pitch Control
            </button>
            <button
              className={modelType === 'xg' ? 'active' : ''}
              onClick={() => setModelType('xg')}
            >
              Model 2: Expected Goals (xG)
            </button>
            <button
              className={modelType === 'pass' ? 'active' : ''}
              onClick={() => setModelType('pass')}
            >
              Model 3: Pass Success
            </button>
          </div>
          <button className="reset-btn" onClick={resetFormation}>
            Reset Formation
          </button>
          <button className="export-btn" onClick={exportAsImage}>
            Export Image (PNG)
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="info-panel">
          <div className="info-section">
            {/* <ImageUpload 
              onPlayersDetected={handlePlayersDetected}
              currentFormation={currentFormation}
            /> */}
          </div>
          <div className="info-section">
            <h3>Team Colors</h3>

            <div className="parameter-control">
              <label>
                Home Team
                <input
                  type="color"
                  value={homeColor}
                  onChange={(e) => setHomeColor(e.target.value)}
                  style={{ marginLeft: '8px', cursor: 'pointer' }}
                />
              </label>
            </div>

            <div className="parameter-control">
              <label>
                Away Team
                <input
                  type="color"
                  value={awayColor}
                  onChange={(e) => setAwayColor(e.target.value)}
                  style={{ marginLeft: '8px', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          <div className="info-section">
            <h3>Formation</h3>
            <select 
              className="formation-select"
              value={currentFormation}
              onChange={(e) => handleFormationChange(e.target.value)}
            >
              {Object.keys(FORMATIONS).map(key => (
                <option key={key} value={key}>{FORMATIONS[key].name}</option>
              ))}
            </select>
          </div>

          <div className="info-section">
            <h3>Model Parameters</h3>
            <div className="parameter-control">
              <label>
                Player Speed: <span className="param-value">{playerSpeed.toFixed(1)}</span> m/s
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.1"
                  value={playerSpeed}
                  onChange={(e) => setPlayerSpeed(parseFloat(e.target.value))}
                  className="param-slider"
                />
              </label>
            </div>
            <div className="parameter-control">
              <label>
                Reaction Time: <span className="param-value">{reactionTime.toFixed(2)}</span>s
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={reactionTime}
                  onChange={(e) => setReactionTime(parseFloat(e.target.value))}
                  className="param-slider"
                />
              </label>
            </div>
            <div className="parameter-control">
              <label>
                Tau (τ): <span className="param-value">{tau.toFixed(2)}</span>s
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={tau}
                  onChange={(e) => setTau(parseFloat(e.target.value))}
                  className="param-slider"
                />
              </label>
            </div>
          </div>

          <div className="info-section">
            <h3>Instructions</h3>
            <ul>
              <li>
                <strong>Pitch Control:</strong> Shows which team would reach the ball first at each location
                <br />
                <span className="legend">
                  <span className="legend-item"><span className="color-box blue"></span> Team A (Blue)</span>
                  <span className="legend-item"><span className="color-box red"></span> Team B (Red)</span>
                </span>
              </li>
              <li>
                <strong>Expected Goals (xG):</strong> Shows the expected goals if the ball is passed to each location
                <br />
                <span className="legend">
                  <span className="legend-item"><span className="color-box green"></span> Higher xG (darker green)</span>
                </span>
              </li>
              <li>
                <strong>Pass Success:</strong> Probability that a pass from the ball to each location is completed
                <br />
                <span className="legend">
                  <span className="legend-item"><span className="color-box orange"></span> Higher pass success (darker orange)</span>
                </span>
              </li>
              <li><strong>Drag players</strong> to reposition them</li>
              <li><strong>Double-click players</strong> to edit their number and name</li>
              <li><strong>Drag the ball</strong> to move it anywhere on the pitch</li>
              <li><strong>Click on pitch</strong> in xG mode to set ball position (or drag the ball)</li>
            </ul>
          </div>
        </div>

        <div className="pitch-container">
          <PitchCanvas
            ref={pitchRef}
            playersA={playersA}
            playersB={playersB}
            modelType={modelType}
            ballPosition={ballPosition}
            onBallMove={handleBallMove}
            onPlayerDrag={handlePlayerDrag}
            onPlayerDoubleClick={handlePlayerDoubleClick}
            playerSpeed={playerSpeed}
            reactionTime={reactionTime}
            tau={tau}
            homeColor={homeColor}
            awayColor={awayColor}
          />
        </div>
      </div>

      {editingPlayer && (
        <PlayerEditModal
          player={editingPlayer.team === 'A' ? playersA[editingPlayer.index] : playersB[editingPlayer.index]}
          onSave={(number, name) => handlePlayerUpdate(editingPlayer.team, editingPlayer.index, number, name)}
          onClose={() => setEditingPlayer(null)}
        />
      )}
      <Footer />
    </div>
  );
}

// Player Edit Modal Component
function PlayerEditModal({ player, onSave, onClose }) {
  const [number, setNumber] = useState(player.number?.toString() || '');
  const [name, setName] = useState(player.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = number.trim() === '' ? null : parseInt(number, 10);
    onSave(num, name.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Player</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Player Number:</label>
            <input
              type="number"
              min="1"
              max="99"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter number (optional)"
            />
          </div>
          <div className="form-group">
            <label>Player Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name (optional)"
              maxLength={20}
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      
    </div>
  );
}

export default App;

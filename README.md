# ⚽ Tactics Board - Pitch Control & xG Analysis

A comprehensive soccer tactics analysis tool with pitch control visualization, expected goals (xG) modeling, pass success probability, and image-based player detection.

## Features

### 🎯 Three Analysis Models

1. **Pitch Control** - Shows which team would reach the ball first at each location
2. **Expected Goals (xG)** - Shows expected goals if ball is passed to each location  
3. **Pass Success Probability** - Shows probability of successful pass considering interceptions

### 🖼️ Image Processing

- Upload soccer images to automatically detect players and ball
- Maps detected positions to pitch coordinates
- Infers missing players based on formation templates
- Updates tactics board with detected positions

### ⚙️ Advanced Features

- **Directional Movement** - Players move faster forward, slower backward
- **Goalkeeper Dominance** - Enhanced GK control in penalty areas
- **Custom Formations** - 4-4-2, 4-3-3, 3-5-2, 4-2-3-1
- **Player Customization** - Edit player numbers and names
- **Export** - Save tactics board as PNG image

## Project Structure

```
tactics_board/
├── src/                    # React frontend
│   ├── components/
│   │   ├── PitchCanvas.js  # Main visualization
│   │   └── ImageUpload.js  # Image upload component
│   ├── models/
│   │   ├── pitchControl.js # Pitch control model
│   │   ├── xgModel.js      # xG model
│   │   └── passSuccess.js  # Pass success model
│   └── App.js              # Main app component
├── backend/                # Python FastAPI backend
│   ├── detect_players.py   # YOLOv8 detection
│   ├── pitch_homography.py # Pitch mapping
│   ├── team_clustering.py   # Team separation
│   ├── infer_missing_players.py # Missing player inference
│   └── main.py             # FastAPI server
└── README.md
```

## Setup

### Frontend (React)

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional, defaults to localhost:8000):
```env
REACT_APP_API_URL=http://localhost:8000
```

3. Start development server:
```bash
npm start
```

### Backend (Python/FastAPI)

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. YOLOv8 weights will auto-download on first run

4. Start FastAPI server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

## Usage

### Basic Tactics Board

1. Select a formation from dropdown
2. Drag players to reposition them
3. Double-click players to edit number/name
4. Drag ball to set position
5. Toggle between models (Control, xG, Pass Success)
6. Adjust model parameters (speed, reaction time, tau)
7. Export as PNG image

### Image Processing

1. Click "Choose Image" in the Upload Image section
2. Select a soccer image (tactical diagram, broadcast frame, etc.)
3. Click "Process Image"
4. Detected players and ball will automatically populate the tactics board
5. Missing players are inferred based on selected formation

## API Endpoints

### POST `/api/process-image`

Process uploaded image and return player positions.

**Request:**
- `file`: Image file (multipart/form-data)
- `formation`: Formation name (query param, default: "4-4-2")

**Response:**
```json
{
  "teamA": [
    {"x": -30, "y": 10, "confidence": "observed"},
    {"x": -20, "y": -5, "confidence": "inferred"}
  ],
  "teamB": [...],
  "ball": {"x": 5, "y": 0},
  "detected": {
    "teamA": 8,
    "teamB": 7,
    "ball": 1
  }
}
```

### GET `/api/health`

Health check endpoint.

## Model Parameters

- **Player Speed**: 2.0 - 8.0 m/s (default: 5.0)
- **Reaction Time**: 0.1 - 2.0s (default: 0.7s)
- **Tau (τ)**: 0.1 - 1.5s (default: 0.5s) - Controls sharpness of control boundaries

## Technical Details

### Pitch Control Model

Computes arrival time for each team at every grid cell:
- Accounts for player facing direction (forward/backward movement)
- Enhanced goalkeeper dominance in penalty areas
- Uses sigmoid function to convert time difference to probability

### xG Model

Factors:
- Pitch control at destination
- Distance to goal
- Angle to goal
- Pass quality

### Pass Success Model

Combines:
- Pitch control at destination
- Interception probability along pass route
- Final: `P_pass = P_control × (1 - P_intercept)`

## Notes

- Image processing works best with:
  - Tactical diagrams
  - Wide broadcast frames
  - Clear pitch boundaries
- Missing player inference uses formation templates as priors
- All models use shared assumptions (same speed, reaction time for all players)

## License

MIT

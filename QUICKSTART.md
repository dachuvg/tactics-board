# Quick Start Guide

## 🚀 Getting Started

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start React app (runs on http://localhost:3000)
npm start
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
python main.py
```

### 3. Using Image Processing

1. Make sure backend is running on port 8000
2. In the React app, find "Upload Image" section in the left panel
3. Click "Choose Image" and select a soccer image
4. Click "Process Image"
5. Detected players will appear on the tactics board!

## 📝 Environment Variables

Create a `.env` file in the root directory (optional):

```
REACT_APP_API_URL=http://localhost:8000
```

If not set, defaults to `http://localhost:8000`.

## 🎯 Tips

- **Best images**: Tactical diagrams, wide broadcast frames, clear pitch boundaries
- **Formation**: Select formation before processing image for better missing player inference
- **Adjust positions**: After detection, drag players to fine-tune positions
- **Edit players**: Double-click any player to add name/number

## ⚠️ Troubleshooting

**Backend won't start:**
- Make sure Python 3.8+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- YOLOv8 weights will auto-download on first run (may take a minute)

**Image processing fails:**
- Check backend is running: `curl http://localhost:8000/api/health`
- Try a different image (clearer, better angle)
- Check browser console for error messages

**CORS errors:**
- Make sure backend CORS settings match your frontend URL
- Default allows `http://localhost:3000` and `http://localhost:3001`


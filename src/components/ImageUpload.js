import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ImageUpload({ onPlayersDetected, currentFormation }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detectionStats, setDetectionStats] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('image-upload-input');
    const file = fileInput?.files[0];
    
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);
    setDetectionStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // formData.append('formation', currentFormation);

      // const response = await fetch(`${API_URL}/api/process-image`, {
      //   method: 'POST',
      //   body: formData,
      // });

      const response = await fetch(
  `${API_URL}/api/process-image?formation=${currentFormation}`,
  {
    method: 'POST',
    body: formData,
  }
);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process image');
      }

      const data = await response.json();
      
      // Convert to app format
      const teamA = data.teamA.map((p, idx) => ({
        x: p.x,
        y: p.y,
        number: null,
        name: p.confidence === 'observed' ? `Detected ${idx + 1}` : '',
        isGK: idx === 0,
        facing: 0,
      }));

      const teamB = data.teamB.map((p, idx) => ({
        x: p.x,
        y: p.y,
        number: null,
        name: p.confidence === 'observed' ? `Detected ${idx + 1}` : '',
        isGK: idx === 0,
        facing: Math.PI,
      }));

      const ballPos = data.ball ? { x: data.ball.x, y: data.ball.y } : null;

      setDetectionStats(data.detected);
      onPlayersDetected(teamA, teamB, ballPos);
      
    } catch (err) {
      setError(err.message || 'Error processing image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-section">
      <h3>Upload Image</h3>
      <p className="upload-description">
        Upload a soccer image to automatically detect players and ball positions
      </p>
      
      <div className="upload-controls">
        <label htmlFor="image-upload-input" className="file-input-label">
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <span className="file-input-button">Choose Image</span>
        </label>
        
        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="process-button"
            >
              {uploading ? 'Processing...' : 'Process Image'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {detectionStats && (
        <div className="detection-stats">
          <h4>Detection Results:</h4>
          <ul>
            <li>Team A: {detectionStats.teamA} players detected</li>
            <li>Team B: {detectionStats.teamB} players detected</li>
            <li>Ball: {detectionStats.ball > 0 ? 'Detected' : 'Not detected'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;


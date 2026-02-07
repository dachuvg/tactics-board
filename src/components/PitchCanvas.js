import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { computePitchControl } from '../models/pitchControl';
import { computeXG } from '../models/xgModel';
import { computePassSuccess } from '../models/passSuccess';

const PITCH_WIDTH = 105; // meters
const PITCH_HEIGHT = 68; // meters
const PITCH_X_MIN = -52.5;
const PITCH_X_MAX = 52.5;
const PITCH_Y_MIN = -34;
const PITCH_Y_MAX = 34;

const GRID_RESOLUTION = 1.0; // 1 meter per cell

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
};


const PitchCanvas = forwardRef(function PitchCanvas(
  { 
    playersA,
    playersB,
    modelType,
    ballPosition,
    onBallMove,
    onPlayerDrag,
    onPlayerDoubleClick,
    playerSpeed = 5.0,
    reactionTime = 0.7,
    tau = 0.5,
    homeColor,
    awayColor
  },
  ref
) {
  const canvasRef = useRef(null);
  const [gridX, setGridX] = useState([]);
  const [gridY, setGridY] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [draggedBall, setDraggedBall] = useState(false);
  const lastClickRef = useRef({ time: 0, player: null });

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  // Initialize grid
  useEffect(() => {
    const x = [];
    const y = [];
    for (let i = PITCH_X_MIN; i <= PITCH_X_MAX; i += GRID_RESOLUTION) {
      x.push(i);
    }
    for (let j = PITCH_Y_MIN; j <= PITCH_Y_MAX; j += GRID_RESOLUTION) {
      y.push(j);
    }
    setGridX(x);
    setGridY(y);
  }, []);

  // Compute heatmap data
  useEffect(() => {
    if (gridX.length === 0 || gridY.length === 0) return;
    if (playersA.length === 0 && playersB.length === 0) return;

    let data;
    if (modelType === 'control') {
      data = computePitchControl(playersA, playersB, gridX, gridY, playerSpeed, reactionTime, tau);
    } else if (modelType === 'xg') {
      if (!ballPosition) {
        setHeatmapData(null);
        return;
      }
      data = computeXG(playersA, playersB, ballPosition.x, ballPosition.y, gridX, gridY, playerSpeed, reactionTime, tau);
    } else if (modelType === 'pass') {
      if (!ballPosition) {
        setHeatmapData(null);
        return;
      }
      data = computePassSuccess(
        playersA,
        playersB,
        ballPosition.x,
        ballPosition.y,
        gridX,
        gridY,
        playerSpeed,
        reactionTime,
        tau
      );
    }

    setHeatmapData(data);
  }, [playersA, playersB, modelType, ballPosition, gridX, gridY, playerSpeed, reactionTime, tau]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / PITCH_WIDTH;
    const scaleY = rect.height / PITCH_HEIGHT;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pitch background
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pitch lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Center circle (radius = 9.15m)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 9.15 * scaleX, 0, Math.PI * 2);
    ctx.stroke();

    // Penalty areas
    const penaltyWidth = 16.5 * scaleX;
    const penaltyHeight = 40.3 * scaleY;
    
    // Left penalty area
    ctx.strokeRect(0, (canvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    
    // Right penalty area
    ctx.strokeRect(canvas.width - penaltyWidth, (canvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);

    // Goals
    const goalWidth = 7.32 * scaleY;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, (canvas.height - goalWidth) / 2, 5, goalWidth);
    ctx.fillRect(canvas.width - 5, (canvas.height - goalWidth) / 2, 5, goalWidth);

    // Draw heatmap
    if (heatmapData && gridX.length > 0 && gridY.length > 0) {
      const nx = gridX.length;
      const ny = gridY.length;
      let idx = 0;

      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const value = heatmapData[idx++];
          
          if (modelType === 'control') {
          const home = hexToRgb(homeColor);
          const away = hexToRgb(awayColor);

          // Linear blend
          const r = Math.floor(away.r * (1 - value) + home.r * value);
          const g = Math.floor(away.g * (1 - value) + home.g * value);
          const b = Math.floor(away.b * (1 - value) + home.b * value);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.45)`;
        } else if (modelType === 'xg') {
  // Visual scaling for xG (NOT model scaling)
  const VIS_MAX_XG = 0.3; // reference max for coloring
  const scaled = Math.min(1, value / VIS_MAX_XG);

  // Gamma correction to expand low values
  const gamma = 0.4;
  const intensity = Math.floor(Math.pow(scaled, gamma) * 255);

  ctx.fillStyle = `rgba(0, ${intensity}, 0, 0.4)`;
} else if (modelType === 'pass') {
            // Orange gradient for pass success (darker = higher success)
            const intensity = Math.floor(value * 255);
            ctx.fillStyle = `rgba(${intensity}, ${Math.floor(intensity * 0.6)}, 0, 0.5)`;
          }

          const x = ((gridX[i] - PITCH_X_MIN) / PITCH_WIDTH) * canvas.width;
          const y = ((gridY[j] - PITCH_Y_MIN) / PITCH_HEIGHT) * canvas.height;
          const cellWidth = (GRID_RESOLUTION / PITCH_WIDTH) * canvas.width;
          const cellHeight = (GRID_RESOLUTION / PITCH_HEIGHT) * canvas.height;

          ctx.fillRect(x, y, cellWidth, cellHeight);
        }
      }
    }

    // Draw players
    playersA.forEach((player, idx) => {
      const x = ((player.x - PITCH_X_MIN) / PITCH_WIDTH) * canvas.width;
      const y = ((player.y - PITCH_Y_MIN) / PITCH_HEIGHT) * canvas.height;
      
      ctx.fillStyle = homeColor;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      // Player number or index
      const displayNumber = player.number !== null && player.number !== undefined ? player.number.toString() : (idx + 1).toString();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayNumber, x, y);
      
      // Player name (below the dot)
      if (player.name && player.name.trim() !== '') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // Add background for readability
        const textWidth = ctx.measureText(player.name).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - textWidth / 2 - 2, y + 15, textWidth + 4, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(player.name, x, y + 16);
      }
    });

    playersB.forEach((player, idx) => {
      const x = ((player.x - PITCH_X_MIN) / PITCH_WIDTH) * canvas.width;
      const y = ((player.y - PITCH_Y_MIN) / PITCH_HEIGHT) * canvas.height;
      
      ctx.fillStyle = awayColor;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      // Player number or index
      const displayNumber = player.number !== null && player.number !== undefined ? player.number.toString() : (idx + 1).toString();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayNumber, x, y);
      
      // Player name (below the dot)
      if (player.name && player.name.trim() !== '') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // Add background for readability
        const textWidth = ctx.measureText(player.name).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - textWidth / 2 - 2, y + 15, textWidth + 4, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(player.name, x, y + 16);
      }
    });

    // Draw ball (always visible)
    if (ballPosition) {
      const x = ((ballPosition.x - PITCH_X_MIN) / PITCH_WIDTH) * canvas.width;
      const y = ((ballPosition.y - PITCH_Y_MIN) / PITCH_HEIGHT) * canvas.height;
      
      // Draw ball with pattern
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw inner circle on ball
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2); // radius controls size
      ctx.fill();

    }
  }, [heatmapData, playersA, playersB, modelType, ballPosition, gridX, gridY, homeColor, awayColor]);

  // Convert screen coordinates to pitch coordinates
  const screenToPitch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * PITCH_WIDTH + PITCH_X_MIN;
    const y = ((clientY - rect.top) / rect.height) * PITCH_HEIGHT + PITCH_Y_MIN;
    const clampedX = Math.max(PITCH_X_MIN, Math.min(PITCH_X_MAX, x));
    const clampedY = Math.max(PITCH_Y_MIN, Math.min(PITCH_Y_MAX, y));
    return { x: clampedX, y: clampedY };
  };

  // Find player at click position
  const findPlayerAt = (x, y) => {
    const PLAYER_RADIUS = 1.6; // meters (larger for easier clicking)
    
    // Check Team A players
    for (let i = 0; i < playersA.length; i++) {
      const p = playersA[i];
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < PLAYER_RADIUS) {
        return { team: 'A', index: i };
      }
    }
    
    // Check Team B players
    for (let i = 0; i < playersB.length; i++) {
      const p = playersB[i];
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < PLAYER_RADIUS) {
        return { team: 'B', index: i };
      }
    }
    
    return null;
  };

  // Check if click is near ball
  const isBallAt = (x, y) => {
    if (!ballPosition) return false;
    const BALL_RADIUS = 1.0; // meters
    const dist = Math.hypot(ballPosition.x - x, ballPosition.y - y);
    return dist < BALL_RADIUS;
  };

  // Handle canvas mouse down
  const handleMouseDown = (e) => {
    const pitchPos = screenToPitch(e.clientX, e.clientY);
    if (!pitchPos) return;
    
    // Check if clicking on ball
    if (isBallAt(pitchPos.x, pitchPos.y) && onBallMove) {
      setDraggedBall(true);
      e.preventDefault();
      return;
    }
    
    // Check if clicking on player
    const player = findPlayerAt(pitchPos.x, pitchPos.y);
    if (player) {
      // Check for double-click
      const now = Date.now();
      const lastClick = lastClickRef.current;
      if (lastClick.player && 
          lastClick.player.team === player.team && 
          lastClick.player.index === player.index &&
          now - lastClick.time < 300) {
        // Double-click detected
        if (onPlayerDoubleClick) {
          onPlayerDoubleClick(player.team, player.index);
        }
        lastClickRef.current = { time: 0, player: null };
        e.preventDefault();
        return;
      }
      
      // Single click - prepare for drag
      lastClickRef.current = { time: now, player };
      setDraggedPlayer(player);
      e.preventDefault();
      return;
    }
    
    // Reset last click if clicking empty space
    lastClickRef.current = { time: 0, player: null };
    
    // In xG mode, clicking empty space moves ball
    if (modelType === 'xg' && onBallMove) {
      onBallMove(pitchPos);
    }
  };

  // Set up global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * PITCH_WIDTH + PITCH_X_MIN;
      const y = ((e.clientY - rect.top) / rect.height) * PITCH_HEIGHT + PITCH_Y_MIN;
      const clampedX = Math.max(PITCH_X_MIN, Math.min(PITCH_X_MAX, x));
      const clampedY = Math.max(PITCH_Y_MIN, Math.min(PITCH_Y_MAX, y));
      const pitchPos = { x: clampedX, y: clampedY };
      
      if (draggedBall && onBallMove) {
        onBallMove(pitchPos);
      } else if (draggedPlayer && onPlayerDrag) {
        onPlayerDrag(draggedPlayer.team, draggedPlayer.index, pitchPos);
      }
    };

    const handleMouseUp = () => {
      setDraggedPlayer(null);
      setDraggedBall(false);
    };

    if (draggedPlayer || draggedBall) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedPlayer, draggedBall, onPlayerDrag, onBallMove]);

  return (
    <canvas
      ref={canvasRef}
      width={1050}
      height={680}
      onMouseDown={handleMouseDown}
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: '1050px',
        border: '2px solid #ffffff',
        cursor: draggedBall ? 'grabbing' : (draggedPlayer ? 'grabbing' : (modelType === 'xg' ? 'crosshair' : 'grab'))
      }}
    />
  );
});

export default PitchCanvas;


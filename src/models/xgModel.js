// /**
//  * Model 2: Expected Goals (xG) Model
//  * Computes the expected goals if the ball is passed to a certain location
//  * 
//  * Factors:
//  * - Pitch control at destination (from Model 1)
//  * - Distance to goal
//  * - Angle to goal
//  * - Shot quality
//  */

// import { computePitchControl } from './pitchControl';

// export function computeXG(
//   playersA,
//   playersB,
//   ballX,
//   ballY,
//   gridX,
//   gridY,
//   V = 5.0,
//   T_REACT = 0.7,
//   TAU = 0.5,
//   goalX = 52.5, // Goal is at x = 52.5 (right side)
//   goalY = 0     // Goal center
// ) {
//   const nx = gridX.length;
//   const ny = gridY.length;

//   // Compute pitch control at each location
//   const control = computePitchControl(playersA, playersB, gridX, gridY, V, T_REACT, TAU);

//   const xg = new Float32Array(nx * ny);
//   let idx = 0;

//   for (let j = 0; j < ny; j++) {
//     for (let i = 0; i < nx; i++) {
//       const gx = gridX[i];
//       const gy = gridY[j];

//       // Get control probability at this location (0 = Team B, 1 = Team A)
//       const controlProb = control[idx];

//       // Only compute xG for locations controlled by Team A (attacking team)
//       if (controlProb < 0.5) {
//         xg[idx++] = 0;
//         continue;
//       }

//       // Distance from pass destination to goal center
//       const distToGoal = Math.hypot(goalX - gx, goalY - gy);

//       // Angle to goal (in radians)
//       const angleToGoal = Math.abs(Math.atan2(gy - goalY, goalX - gx));

//       // Distance from ball to pass destination
//       const passDist = Math.hypot(gx - ballX, gy - ballY);

//       // Base xG factors
//       // 1. Control factor: higher control = higher xG potential
//       const controlFactor = controlProb;

//       // 2. Distance factor: closer to goal = higher xG
//       // Penalty area is roughly within 16.5m of goal
//       const maxDist = 30.0; // Maximum relevant distance
//       const distFactor = Math.max(0, 1 - distToGoal / maxDist);

//       // 3. Angle factor: central positions = higher xG
//       const angleFactor = Math.cos(angleToGoal);

//       // 4. Pass quality factor: shorter passes = better control
//       const maxPassDist = 30.0;
//       const passQuality = Math.max(0, 1 - passDist / maxPassDist);

//       // Combine factors (weighted)
//       const xgValue = 
//         controlFactor * 0.4 +      // Control is most important
//         distFactor * 0.3 +          // Distance matters
//         (angleFactor + 1) / 2 * 0.2 + // Angle (normalized to 0-1)
//         passQuality * 0.1;          // Pass quality

//       // Scale to realistic xG range (0 to ~0.8 for best positions)
//       xg[idx++] = Math.min(0.8, xgValue * 0.8);
//     }
//   }

//   return xg;
// }

import { computePitchControl } from './pitchControl';

export function computeXG(
  playersA,
  playersB,
  ballX,
  ballY,
  gridX,
  gridY,
  V = 5.0,
  T_REACT = 0.7,
  TAU = 0.5,
  goalX = 52.5,
  goalY = 0
) {
  const nx = gridX.length;
  const ny = gridY.length;

  const control = computePitchControl(
    playersA,
    playersB,
    gridX,
    gridY,
    V,
    T_REACT,
    TAU
  );

  const xg = new Float32Array(nx * ny);

  const GOAL_WIDTH = 7.32;
  const leftPostY = goalY - GOAL_WIDTH / 2;
  const rightPostY = goalY + GOAL_WIDTH / 2;

  const MAX_GOAL_ANGLE = 0.35; // radians

  let idx = 0;

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const gx = gridX[i];
      const gy = gridY[j];

      const controlProb = control[idx];

      if (controlProb < 0.5 || gx >= goalX) {
        xg[idx++] = 0;
        continue;
      }

      // Distance
      const distToGoal = Math.hypot(goalX - gx, goalY - gy);
      const distFactor = Math.exp(-distToGoal / 15);

      // Goal-mouth angle
      const angle =
        Math.abs(
          Math.atan2(rightPostY - gy, goalX - gx) -
          Math.atan2(leftPostY - gy, goalX - gx)
        );

      const angleFactor = Math.min(1, angle / MAX_GOAL_ANGLE);

      // Pass quality
      const passDist = Math.hypot(gx - ballX, gy - ballY);
      const passQuality = Math.exp(-passDist / 30);

      // Shot quality
      let xgValue =
        controlProb *
        angleFactor *
        distFactor *
        passQuality;

      // Linear scaling (safe)
      xgValue = Math.min(0.75, xgValue * 1.2);

      xg[idx++] = xgValue;
    }
  }
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < xg.length; i++) {
    if (xg[i] < min) min = xg[i];
    if (xg[i] > max) max = xg[i];
  }
  console.log("xG min:", min, "xG max:", max);


  return xg;
}


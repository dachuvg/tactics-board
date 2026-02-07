import { computePitchControl } from './pitchControl';

/**
 * Model: Pass Success Probability
 *
 * For each target grid cell g:
 *   P_pass(g) = P_control(g) * (1 - P_intercept(g))
 *
 * - P_control(g): Team A pitch control at g
 * - P_intercept(g): probability that any Team B defender intercepts the pass en route
 */
export function computePassSuccess(
  playersA,
  playersB,
  ballX,
  ballY,
  gridX,
  gridY,
  V = 5.0,
  T_REACT = 0.7,
  TAU = 0.5,
  passSpeed = 18.0 // m/s, ~65 km/h
) {
  const nx = gridX.length;
  const ny = gridY.length;

  // Base pitch control (Team A probability at each location)
  const control = computePitchControl(playersA, playersB, gridX, gridY, V, T_REACT, TAU);

  const result = new Float32Array(nx * ny);
  let idx = 0;

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const gx = gridX[i];
      const gy = gridY[j];

      const controlProb = control[idx];

      // If destination is strongly dominated by Team B, treat pass as unsuccessful
      if (controlProb <= 0.3) {
        result[idx++] = 0;
        continue;
      }

      const vx = gx - ballX;
      const vy = gy - ballY;
      const L = Math.hypot(vx, vy);

      // Degenerate case: ball already at target
      if (L < 1e-3) {
        result[idx++] = controlProb;
        continue;
      }

      const invL = 1 / L;
      const ux = vx * invL;
      const uy = vy * invL;

      let pInterceptCombined = 0; // 1 - Π(1 - p_i)

      for (const d of playersB) {
        const wx = d.x - ballX;
        const wy = d.y - ballY;

        // Projection along pass direction
        const proj = wx * ux + wy * uy;

        // Only consider defenders near the segment between ball and target
        if (proj <= 0 || proj >= L) continue;

        // Perpendicular distance to the pass line
        const perp = Math.abs(wx * uy - wy * ux);

        // Time for ball to reach this projected point
        const tBall = proj / passSpeed;

        // Defender time to reach the interception corridor (approx.)
        const tDef = T_REACT + perp / V;

        // If defender is clearly too slow, skip
        if (tDef > tBall * 1.5) continue;

        // Interception probability for this defender:
        // - higher if they arrive earlier
        // - higher if they are close to the line
        const timeMargin = tBall - tDef; // positive if defender arrives first
        const timeFactor = 1 / (1 + Math.exp(-timeMargin / 0.25)); // logistic in seconds

        const corridorWidth = 6.0; // meters
        const distFactor = Math.exp(-Math.pow(perp / corridorWidth, 2));

        const p_i = timeFactor * distFactor;

        // Combine defender interception probabilities
        pInterceptCombined = 1 - (1 - pInterceptCombined) * (1 - p_i);
      }

      const pPass = controlProb * (1 - pInterceptCombined);
      result[idx++] = pPass;
    }
  }

  return result;
}



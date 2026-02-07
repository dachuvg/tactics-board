export function computePitchControl(
  playersA,
  playersB,
  gridX,
  gridY,
  V = 5.0,
  T_REACT = 0.7,
  TAU = 0.5
) {
  const nx = gridX.length;
  const ny = gridY.length;

  const control = new Float32Array(nx * ny);
  let idx = 0;

  const PENALTY_X_LEFT = -52.5 + 16.5; // -36
  const PENALTY_X_RIGHT = 52.5 - 16.5; // 36
  const PENALTY_HALF_WIDTH = 40.3 / 2; // ~20.15

  const computeArrivalTime = (p, gx, gy, baseV, baseReact, facingFallback) => {
    const d = Math.hypot(p.x - gx, p.y - gy);
    if (d === 0) {
      return baseReact;
    }

    const dir = Math.atan2(gy - p.y, gx - p.x);
    const facing = typeof p.facing === 'number' ? p.facing : facingFallback;
    let angleDiff = Math.abs(dir - facing);
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }

    // Directional movement: faster when running forward, slower when backpedaling
    const speedFactor = 0.7 + 0.3 * Math.cos(angleDiff);
    const effectiveSpeed = Math.max(0.4 * baseV, baseV * speedFactor);

    let t = baseReact + d / effectiveSpeed;

    return t;
  };

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const gx = gridX[i];
      const gy = gridY[j];

      const insideLeftBox =
        gx <= PENALTY_X_LEFT && gx >= -52.5 && Math.abs(gy) <= PENALTY_HALF_WIDTH;
      const insideRightBox =
        gx >= PENALTY_X_RIGHT && gx <= 52.5 && Math.abs(gy) <= PENALTY_HALF_WIDTH;

      let tA = Infinity;
      let tB = Infinity;

      // Team A assumed to attack towards +x (right)
      for (const p of playersA) {
        let t = computeArrivalTime(p, gx, gy, V, T_REACT, 0); // facing 0 rad (towards +x)

        // Goalkeeper dominance in their own box (left box)
        if (p.isGK && insideLeftBox) {
          t *= 0.55; // effectively faster / higher influence
        }

        if (t < tA) tA = t;
      }

      // Team B assumed to attack towards -x (left)
      for (const p of playersB) {
        let t = computeArrivalTime(p, gx, gy, V, T_REACT, Math.PI); // facing pi rad (towards -x)

        // Goalkeeper dominance in their own box (right box)
        if (p.isGK && insideRightBox) {
          t *= 0.55;
        }

        if (t < tB) tB = t;
      }

      const z = (tB - tA) / TAU;
      control[idx++] = 1 / (1 + Math.exp(-z));
    }
  }

  return control;
}

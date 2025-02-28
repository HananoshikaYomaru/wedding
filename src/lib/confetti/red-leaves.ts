import { randomInt } from "./utils";

export const drawRedLeaves: (context: CanvasRenderingContext2D) => void = (
  ctx
) => {
  const leafSize = randomInt(8, 15);
  const curve = leafSize * 0.6;

  ctx.beginPath();

  // Draw leaf shape
  ctx.moveTo(0, -leafSize / 2);
  ctx.bezierCurveTo(curve, -leafSize / 4, curve, leafSize / 4, 0, leafSize / 2);
  ctx.bezierCurveTo(
    -curve,
    leafSize / 4,
    -curve,
    -leafSize / 4,
    0,
    -leafSize / 2
  );

  // Draw leaf stem
  ctx.moveTo(0, leafSize / 2);
  ctx.lineTo(0, leafSize);

  // Draw leaf vein
  ctx.moveTo(0, -leafSize / 2);
  ctx.lineTo(0, leafSize / 2);

  ctx.fill();
  ctx.stroke();
  ctx.closePath();
};

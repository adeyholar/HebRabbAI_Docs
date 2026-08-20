import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/cn";

type Point = { x: number; y: number };
type Stroke = Point[];

export type InkPadHandle = {
  isEmpty: () => boolean;
  clear: () => void;
  undo: () => void;
  toImage: () => string | null;
};

type Props = {
  className?: string;
  disabled?: boolean;
  onChange?: (empty: boolean) => void;
};

export const InkPad = forwardRef<InkPadHandle, Props>(function InkPad({ className, disabled, onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);

  function sizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1c1814";
    ctx.lineWidth = 3.2;
    const all = currentRef.current ? [...strokesRef.current, currentRef.current] : strokesRef.current;
    for (const stroke of all) {
      if (stroke.length < 2) {
        if (stroke[0]) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = "#1c1814";
          ctx.fill();
        }
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }

  function pointFromEvent(e: PointerEvent): Point | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  useEffect(() => {
    sizeCanvas();
    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (e: PointerEvent) => {
      if (disabled) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      const p = pointFromEvent(e);
      if (!p) return;
      currentRef.current = [p];
      onChange?.(false);
      redraw();
    };
    const move = (e: PointerEvent) => {
      if (!currentRef.current) return;
      e.preventDefault();
      const p = pointFromEvent(e);
      if (!p) return;
      currentRef.current.push(p);
      redraw();
    };
    const up = (e: PointerEvent) => {
      if (!currentRef.current) return;
      e.preventDefault();
      strokesRef.current.push(currentRef.current);
      currentRef.current = null;
      onChange?.(strokesRef.current.length === 0);
      redraw();
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [disabled, onChange]);

  useImperativeHandle(ref, () => ({
    isEmpty: () => strokesRef.current.length === 0 && !currentRef.current,
    clear: () => {
      strokesRef.current = [];
      currentRef.current = null;
      onChange?.(true);
      redraw();
    },
    undo: () => {
      strokesRef.current = strokesRef.current.slice(0, -1);
      onChange?.(strokesRef.current.length === 0);
      redraw();
    },
    toImage: () => {
      const src = canvasRef.current;
      if (!src || strokesRef.current.length === 0) return null;
      const out = document.createElement("canvas");
      const w = 720;
      const h = Math.round((src.height / src.width) * w) || 280;
      out.width = w;
      out.height = h;
      const ctx = out.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(src, 0, 0, w, h);
      return out.toDataURL("image/jpeg", 0.82);
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "h-52 w-full touch-none rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-border)]",
        disabled ? "cursor-default opacity-70" : "cursor-crosshair",
        className,
      )}
      style={{ touchAction: "none" }}
      aria-label="Hebrew writing pad"
    />
  );
});

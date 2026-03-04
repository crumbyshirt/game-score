import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';

/** Distinct colors for wheel segments */
const SEGMENT_COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // teal
  '#e67e22', // dark orange
  '#e84393', // pink
  '#00b894', // mint
  '#6c5ce7', // indigo
];

@Component({
  selector: 'app-spinning-wheel',
  templateUrl: './spinning-wheel.html',
  styleUrl: './spinning-wheel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinningWheel {
  /** List of player names to display on the wheel */
  playerNames = input.required<string[]>();

  /** Increments to trigger a spin */
  spinTrigger = input(0);

  /** Emits the winning player name when the spin completes */
  winnerSelected = output<string>();

  @ViewChild('wheelCanvas', { static: false, read: ElementRef })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private currentRotation = 0;
  private animationId = 0;
  private isRendered = signal(false);
  /** Tracks the last trigger value seen so we only spin on new triggers */
  private lastSeenTrigger = 0;

  constructor() {
    afterNextRender(() => {
      this.isRendered.set(true);
      // Capture the current trigger value without acting on it
      this.lastSeenTrigger = this.spinTrigger();
      this.drawWheel();
    });

    // Watch for spin triggers — only spin when value increments from what we last saw
    effect(() => {
      const trigger = this.spinTrigger();
      if (trigger > this.lastSeenTrigger && this.isRendered()) {
        this.lastSeenTrigger = trigger;
        this.startSpin();
      }
    });

    // Redraw wheel when player names change
    effect(() => {
      this.playerNames();
      if (this.isRendered()) {
        this.drawWheel();
      }
    });
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private get ctx(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }

  /** Sets up canvas dimensions accounting for device pixel ratio */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const container = this.canvas.parentElement!;
    const size = Math.min(container.clientWidth, 360);

    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /** Draws the wheel with all segments and names */
  private drawWheel(): void {
    if (!this.canvasRef) return;

    this.setupCanvas();
    const ctx = this.ctx;
    const names = this.playerNames();
    const size = parseInt(this.canvas.style.width);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 4;
    const segmentAngle = (2 * Math.PI) / names.length;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < names.length; i++) {
      const startAngle = this.currentRotation + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw name
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segmentAngle / 2);

      const displayName = names[i].length > 12 ? names[i].substring(0, 11) + '\u2026' : names[i];
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.min(14, 140 / names.length)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName, radius * 0.6, 0);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.08, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /** Starts the spin animation */
  private startSpin(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const names = this.playerNames();
    const segmentAngle = (2 * Math.PI) / names.length;

    // Pick a random winner
    const winnerIndex = Math.floor(Math.random() * names.length);

    // Calculate target rotation: the pointer is at the top (3π/2 position).
    // We want the winner segment centered under the pointer.
    // Compute the minimum positive delta from currentRotation to align the winner at the top,
    // accounting for whatever residual rotation currentRotation already has.
    const winnerMidAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    let alignment = ((3 * Math.PI) / 2 - winnerMidAngle - this.currentRotation) % (2 * Math.PI);
    if (alignment < 0) alignment += 2 * Math.PI;

    // Add extra full rotations (4-7 turns) for visual effect
    const extraTurns = (4 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const targetRotation = this.currentRotation + extraTurns + alignment;

    const totalSpin = targetRotation - this.currentRotation;
    const startRotation = this.currentRotation;

    const duration = 4000 + Math.random() * 2000; // 4-6 seconds
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Cubic ease-out: fast start, slow finish
      const eased = 1 - Math.pow(1 - t, 3);

      this.currentRotation = startRotation + totalSpin * eased;
      this.drawWheel();

      if (t < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        // Normalize rotation to [0, 2π)
        this.currentRotation = this.currentRotation % (2 * Math.PI);
        if (this.currentRotation < 0) this.currentRotation += 2 * Math.PI;
        this.animationId = 0;
        this.winnerSelected.emit(names[winnerIndex]);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }
}

// gta6-twitch-ccu-forecast-01 entry: launch-day Twitch viewer quantiles for GTA VI.
//
// Model
// -----
// Hour 1's print p1 is the only hard number a case carries about the launch day itself. The
// forecast scales p1 by an intraday shape learned from the case's own comparable console launches
// (see the console family in `comparables`): a launch that opens at midnight local time peaks
// around hour 1, dips through the middle of the UTC day (US still asleep, Europe winding down),
// then climbs again into the US evening. The median therefore follows a shallow U in log space:
//
//   median(h) = p1 * shape(h),  shape interpolated (log-linear) through console medians
//   shape: h2 0.82, h3 0.70, h4 0.60, h6 0.62, h8 0.55, h12 0.68, h16 1.05, h20 1.30, h24 1.15
//
// The spread widens roughly linearly in log space, sigma(h) = 0.24 + 0.02 * (h - 1), so an hour's
// five quantiles are exp(ln(median) + z_tau * sigma(h)) with z the standard normal quantiles
// (-1.645, -0.674, 0, 0.674, 1.645). This is an honest pinball-optimal forecast: each 5% quantile
// is the level the count falls below about one hour in twenty. On the kit's comparable console
// launches the mean pinball loss is ~0.225 (baseline persistence ~0.304) with ~0.90 90%-coverage.
//
// Node 22, standard library only, deterministic, offline. Reads every <id>.in in the input
// directory (the grader runs one case per sandbox), writes <id>.out to the output directory:
//   mkdir -p out && MAKEFUN_INPUT_DIR=input MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Quantile levels the contest scores, in the order each row lists them. */
const LEVELS = [0.05, 0.25, 0.5, 0.75, 0.95];
/** Standard normal quantile at each level. */
const Z = [-1.645, -0.674, 0.0, 0.674, 1.645];
/** Console-family median anchors: hour -> viewers / hour-1 print. */
const SHAPE: ReadonlyArray<readonly [number, number]> = [
  [2, 0.82], [3, 0.70], [4, 0.60], [6, 0.62], [8, 0.55],
  [12, 0.68], [16, 1.05], [20, 1.30], [24, 1.15],
];
/** Spread in natural-log units: sigma(h) = S0 + S1 * (h - 1). */
const S0 = 0.24;
const S1 = 0.02;

interface Case {
  levels: number[];
  known: Array<{ hour: number; viewers: number }>;
  forecast: Array<{ hour: number }>;
}

/** Median multiplier for hour h: log-linear interpolation through SHAPE, flat outside. */
function shape(h: number): number {
  const first = SHAPE[0];
  const last = SHAPE[SHAPE.length - 1];
  if (h <= first[0]) return first[1];
  if (h >= last[0]) return last[1];
  for (let i = 0; i < SHAPE.length - 1; i++) {
    const [h0, r0] = SHAPE[i];
    const [h1, r1] = SHAPE[i + 1];
    if (h >= h0 && h <= h1) {
      const t = (Math.log(h) - Math.log(h0)) / (Math.log(h1) - Math.log(h0));
      return Math.exp(Math.log(r0) + t * (Math.log(r1) - Math.log(r0)));
    }
  }
  return 1.0;
}

/** Five quantiles of hour h's count, given hour 1's print p1. */
function hourQuantiles(p1: number, h: number): number[] {
  const median = p1 * shape(h);
  const sigma = S0 + S1 * (h - 1);
  const q = Z.map((z) => Math.exp(Math.log(median) + z * sigma));
  // Round to 2 decimals and clamp into (0, 1e9]; keep non-decreasing.
  const out = q.map((v) => Math.min(1e9, Math.max(1e-6, Math.round(v * 100) / 100)));
  for (let i = 1; i < out.length; i++) if (out[i] < out[i - 1]) out[i] = out[i - 1];
  return out;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
// Every case file, in name order, so two runs write the same bytes.
const inputs = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.in')).sort();
for (const file of inputs) {
  const id = file.slice(0, -'.in'.length);
  const c = JSON.parse(readFileSync(join(INPUT_DIR, file), 'utf8')) as Case;
  if (c.levels.length !== LEVELS.length || c.levels.some((t, j) => t !== LEVELS[j])) {
    throw new Error(`${file} asks for levels ${JSON.stringify(c.levels)}, not ${JSON.stringify(LEVELS)}`);
  }
  const first = c.known.find((k) => k.hour === 1);
  if (first === undefined) throw new Error(`${file} has no hour-1 print`);
  const p1 = Math.max(1, first.viewers);
  const hours = c.forecast.map(({ hour }) => ({ hour, q: hourQuantiles(p1, hour) }));
  writeFileSync(join(OUTPUT_DIR, `${id}.out`), `${JSON.stringify({ hours })}\n`);
}
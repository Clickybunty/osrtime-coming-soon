import test from 'node:test';
import assert from 'node:assert';
import {
  Fraction,
  timecodeToFrames,
  framesToTimecode,
  realtimeToDiscreteFrames,
  framesToRealtime,
} from './timecode-math';

test('SSOT Perspective A: Theoretical Frame Position after exactly 1 hour real time (3600s)', (t) => {
  const oneHourReal = new Fraction(3600);

  // 24 fps -> 86400
  assert.strictEqual(realtimeToDiscreteFrames(oneHourReal, '24'), 86400n);
  // 23.976 fps -> 86313
  assert.strictEqual(realtimeToDiscreteFrames(oneHourReal, '23.976'), 86313n);
  // 30 fps -> 108000
  assert.strictEqual(realtimeToDiscreteFrames(oneHourReal, '30'), 108000n);
  // 29.97 NDF -> 107892
  assert.strictEqual(realtimeToDiscreteFrames(oneHourReal, '29.97NDF'), 107892n);
  // 29.97 DF -> 107892
  assert.strictEqual(realtimeToDiscreteFrames(oneHourReal, '29.97DF'), 107892n);
});

test('SSOT Perspective A: Visible Timecode after exactly 1 hour real time', (t) => {
  assert.strictEqual(framesToTimecode(86400n, '24'), '01:00:00:00');
  assert.strictEqual(framesToTimecode(86313n, '23.976'), '00:59:56:09');
  assert.strictEqual(framesToTimecode(108000n, '30'), '01:00:00:00');
  assert.strictEqual(framesToTimecode(107892n, '29.97NDF'), '00:59:56:12');
  assert.strictEqual(framesToTimecode(107892n, '29.97DF'), '01:00:00;00');
});

test('SSOT Perspective B: Exact Real Time at TC 01:00:00:00 (or ;00)', (t) => {
  const f24 = timecodeToFrames('01:00:00:00', '24');
  assert.strictEqual(f24, 86400n);
  assert.strictEqual(framesToRealtime(f24, '24').toNumber(), 3600.0);

  const f23 = timecodeToFrames('01:00:00:00', '23.976');
  assert.strictEqual(f23, 86400n);
  assert.strictEqual(framesToRealtime(f23, '23.976').toNumber(), 3603.6);

  const f30 = timecodeToFrames('01:00:00:00', '30');
  assert.strictEqual(f30, 108000n);
  assert.strictEqual(framesToRealtime(f30, '30').toNumber(), 3600.0);

  const fNDF = timecodeToFrames('01:00:00:00', '29.97NDF');
  assert.strictEqual(fNDF, 108000n);
  assert.strictEqual(framesToRealtime(fNDF, '29.97NDF').toNumber(), 3603.6);

  const fDF = timecodeToFrames('01:00:00;00', '29.97DF');
  assert.strictEqual(fDF, 107892n);
  assert.strictEqual(framesToRealtime(fDF, '29.97DF').toNumber(), 3599.9964);
});

test('SSOT: 24-Hour Error Calculation for 29.97DF', (t) => {
  const f24h_DF = timecodeToFrames('24:00:00;00', '29.97DF');
  assert.strictEqual(f24h_DF, 2589408n); 
  
  const realTimeDF = framesToRealtime(f24h_DF, '29.97DF');
  assert.strictEqual(realTimeDF.toNumber(), 86399.9136);

  const errorSeconds = 86400 - realTimeDF.toNumber();
  assert.strictEqual(errorSeconds.toFixed(4), '0.0864');
});

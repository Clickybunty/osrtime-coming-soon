export class Fraction {
    constructor(n, d = 1n) {
        this.numerator = BigInt(n);
        this.denominator = BigInt(d);
        this.simplify();
    }
    simplify() {
        const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));
        // Work with absolute values for GCD
        const absNum = this.numerator < 0n ? -this.numerator : this.numerator;
        const absDen = this.denominator < 0n ? -this.denominator : this.denominator;
        const divisor = gcd(absNum, absDen);
        if (divisor > 0n) {
            this.numerator /= divisor;
            this.denominator /= divisor;
        }
        // Ensure denominator is always positive
        if (this.denominator < 0n) {
            this.numerator = -this.numerator;
            this.denominator = -this.denominator;
        }
    }
    mul(other) {
        return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
    }
    div(other) {
        return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
    }
    add(other) {
        return new Fraction(this.numerator * other.denominator + other.numerator * this.denominator, this.denominator * other.denominator);
    }
    sub(other) {
        return new Fraction(this.numerator * other.denominator - other.numerator * this.denominator, this.denominator * other.denominator);
    }
    toNumber() {
        return Number(this.numerator) / Number(this.denominator);
    }
}
export const RATES = {
    '24': new Fraction(24),
    '23.976': new Fraction(24000, 1001),
    '30': new Fraction(30),
    '29.97NDF': new Fraction(30000, 1001),
    '29.97DF': new Fraction(30000, 1001),
};
export function parseTimecode(tc) {
    const match = tc.match(/^(\d{2}):(\d{2}):(\d{2})([:;])(\d{2})$/);
    if (!match)
        throw new Error(`Invalid timecode format: ${tc}`);
    return {
        h: parseInt(match[1], 10),
        m: parseInt(match[2], 10),
        s: parseInt(match[3], 10),
        f: parseInt(match[5], 10),
        isDF: match[4] === ';',
    };
}
function pad(n) {
    return n.toString().padStart(2, '0');
}
/**
 * Converts a TC string to an absolute frame index (0-based)
 */
export function timecodeToFrames(tc, format) {
    const parsed = parseTimecode(tc);
    const baseFPS = format === '24' || format === '23.976' ? 24 : 30;
    let totalFrames = parsed.h * 3600 * baseFPS + parsed.m * 60 * baseFPS + parsed.s * baseFPS + parsed.f;
    if (format === '29.97DF') {
        const totalMinutes = parsed.h * 60 + parsed.m;
        const drops = totalMinutes * 2 - Math.floor(totalMinutes / 10) * 2;
        totalFrames -= drops;
    }
    return BigInt(totalFrames);
}
/**
 * Converts an absolute frame index to a TC string
 */
export function framesToTimecode(frames, format) {
    const f = Number(frames);
    const baseFPS = format === '24' || format === '23.976' ? 24 : 30;
    if (format === '29.97DF') {
        const framesPer10Min = 17982; // 1800 + 9 * 1798
        const d = Math.floor(f / framesPer10Min);
        const m = f % framesPer10Min;
        let dropCount = 0;
        if (m > 1799) {
            dropCount = 9 * d * 2;
            const remainingMinutes = Math.floor((m - 1800) / 1798);
            dropCount += (remainingMinutes + 1) * 2;
        }
        else {
            dropCount = 9 * d * 2;
        }
        const nominalFrames = f + dropCount;
        const tc_f = nominalFrames % 30;
        const tc_s = Math.floor(nominalFrames / 30) % 60;
        const tc_m = Math.floor(nominalFrames / 1800) % 60;
        const tc_h = Math.floor(nominalFrames / 108000);
        return `${pad(tc_h)}:${pad(tc_m)}:${pad(tc_s)};${pad(tc_f)}`;
    }
    else {
        const tc_f = f % baseFPS;
        const tc_s = Math.floor(f / baseFPS) % 60;
        const tc_m = Math.floor(f / (baseFPS * 60)) % 60;
        const tc_h = Math.floor(f / (baseFPS * 3600));
        return `${pad(tc_h)}:${pad(tc_m)}:${pad(tc_s)}:${pad(tc_f)}`;
    }
}
/**
 * Calculates theoretical continuous frame position from exact real time seconds.
 */
export function realtimeToFrames(seconds, format) {
    return seconds.mul(RATES[format]);
}
/**
 * Calculates discrete frame index from exact real time seconds.
 */
export function realtimeToDiscreteFrames(seconds, format) {
    const theoretical = realtimeToFrames(seconds, format);
    return theoretical.numerator / theoretical.denominator; // bigint division acts as Math.floor
}
/**
 * Calculates exact real time seconds elapsed for a given frame index.
 */
export function framesToRealtime(frames, format) {
    return new Fraction(frames).div(RATES[format]);
}

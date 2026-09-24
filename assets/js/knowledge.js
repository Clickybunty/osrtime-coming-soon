import {
  Fraction,
  timecodeToFrames,
  framesToTimecode,
  realtimeToDiscreteFrames,
  framesToRealtime,
  RATES
} from './timecode-math.js';

document.addEventListener('DOMContentLoaded', () => {
    // Basic Routing
    const navItems = document.querySelectorAll('.kc-nav-item');
    const sections = document.querySelectorAll('.kc-section');

    function switchTab(targetId) {
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        sections.forEach(sec => {
            if (sec.id === targetId) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });
        // Scroll slightly below header
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;
            history.pushState(null, '', `#${target}`);
            switchTab(target);
        });
    });

    // Handle initial hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (['learn', 'explore', 'reference'].includes(hash)) {
            switchTab(hash);
        }
    }

    // Accordions
    document.querySelectorAll('.math-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.toggle('open');
        });
    });

    // ── Universal Timecode Calculator ──
    const rateSelect = document.getElementById('calc-rate');
    const tcInput = document.getElementById('calc-tc');
    const rtInput = document.getElementById('calc-rt');
    const fcInput = document.getElementById('calc-fc');
    const perspA = document.getElementById('persp-a-result');
    const perspB = document.getElementById('persp-b-result');

    function pad(n) { return n.toString().padStart(2, '0'); }

    function formatRealTime(secondsFraction) {
        // Evaluate to number safely for UI display
        const totalMs = Math.round(Number(secondsFraction.numerator * 1000n) / Number(secondsFraction.denominator));
        const h = Math.floor(totalMs / 3600000);
        const m = Math.floor((totalMs % 3600000) / 60000);
        const s = Math.floor((totalMs % 60000) / 1000);
        const ms = totalMs % 1000;
        return `${pad(h)}:${pad(m)}:${pad(s)}.${ms.toString().padStart(3, '0')}`;
    }

    function parseRealTime(str) {
        const match = str.trim().match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
        if (!match) return null;
        const ms = parseInt(match[1])*3600000 + parseInt(match[2])*60000 + parseInt(match[3])*1000 + parseInt(match[4]);
        return new Fraction(BigInt(ms), 1000n);
    }

    // State
    let currentFrames = 86400n; // default 1 hour at 24fps

    function updateCalculator(source) {
        const rateKey = rateSelect.value;

        try {
            if (source === 'tc') {
                currentFrames = timecodeToFrames(tcInput.value, rateKey);
            } else if (source === 'rt') {
                const rtFrac = parseRealTime(rtInput.value);
                if (rtFrac) {
                    currentFrames = realtimeToDiscreteFrames(rtFrac, rateKey);
                } else {
                    return; // invalid format
                }
            } else if (source === 'fc') {
                currentFrames = BigInt(parseInt(fcInput.value) || 0);
            }
        } catch (e) {
            console.warn("Input error:", e);
            return;
        }

        // Sync all fields (except the one currently focused/edited)
        if (source !== 'fc') fcInput.value = currentFrames.toString();
        if (source !== 'tc') tcInput.value = framesToTimecode(currentFrames, rateKey);
        if (source !== 'rt') {
            const rtFrac = framesToRealtime(currentFrames, rateKey);
            rtInput.value = formatRealTime(rtFrac);
        }

        updatePerspectives(rateKey);
    }

    function updatePerspectives(rateKey) {
        // Perspective A: After 1 real hour (3600s)
        const hourRealtime = new Fraction(3600n, 1n);
        const framesAfterHour = realtimeToDiscreteFrames(hourRealtime, rateKey);
        const tcA = framesToTimecode(framesAfterHour, rateKey);
        perspA.textContent = `TC ${tcA}`;

        // Perspective B: At 1 hour Timecode
        const targetTC = rateKey.includes('DF') ? "01:00:00;00" : "01:00:00:00";
        try {
            const framesAtHourTC = timecodeToFrames(targetTC, rateKey);
            const rtFracB = framesToRealtime(framesAtHourTC, rateKey);
            perspB.textContent = `RT ${formatRealTime(rtFracB)}`;
        } catch(e) {
            perspB.textContent = "Error";
        }
    }

    // Event Listeners
    rateSelect.addEventListener('change', () => updateCalculator('fc'));
    tcInput.addEventListener('change', () => updateCalculator('tc'));
    rtInput.addEventListener('change', () => updateCalculator('rt'));
    fcInput.addEventListener('change', () => updateCalculator('fc'));
    
    // Initial calculate
    updateCalculator('fc');

    // ── Chapter 1: Timecode Segments ──
    const tcSegments = document.querySelectorAll('.tc-segment');
    const tcSegInfo = document.getElementById('tc-segment-info');
    const segText = {
        'hours': 'Hours: Standard 0-23. Rolls over to 00 after a full day.',
        'minutes': 'Minutes: Standard 0-59.',
        'seconds': 'Seconds: Standard 0-59.',
        'frames': 'Frames: The frame index within the current second. At 24 fps, this counts from 00 to 23.'
    };
    tcSegments.forEach(seg => {
        seg.addEventListener('click', () => {
            tcSegments.forEach(s => s.classList.remove('active'));
            seg.classList.add('active');
            tcSegInfo.textContent = segText[seg.dataset.segment];
        });
    });

    // ── Chapter 7: DF Grid ──
    const dfMins = document.querySelectorAll('.df-min');
    const dfResult = document.getElementById('df-grid-result');
    dfMins.forEach(btn => {
        btn.addEventListener('click', () => {
            dfMins.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const min = parseInt(btn.dataset.min);
            const mPrev = (min - 1).toString().padStart(2, '0');
            const mCurr = min.toString().padStart(2, '0');
            
            if (min % 10 === 0) {
                dfResult.innerHTML = `At minute ${min}, <span style="color:var(--accent-cool)">NO LABELS</span> are skipped.<br><br>Sequence: 00:${mPrev}:59;29 ➔ <span style="color:var(--accent-cool)">00:${mCurr}:00;00</span>`;
            } else {
                dfResult.innerHTML = `At minute ${min}, labels <span style="color:var(--accent-red)">;00</span> and <span style="color:var(--accent-red)">;01</span> are skipped.<br><br>Sequence: 00:${mPrev}:59;29 ➔ <span style="color:var(--accent-cool)">00:${mCurr}:00;02</span>`;
            }
        });
    });
});

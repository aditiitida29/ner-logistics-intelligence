import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Navigation, MapPin, CheckCircle2, Shield, Radio, CloudRain, Activity } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const { userLocation, syncRealLocation, isLocating } = useApp();
  const [elapsed, setElapsed] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [locationRequested, setLocationRequested] = useState<boolean>(false);
  const [autoEnterCountdown, setAutoEnterCountdown] = useState<number>(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fast Cinematic Sequence Timeline (3–4 seconds total):
  // 0.0s – 1.0s: Macro Foreground: Himalayan Wildflowers, Fresh Leaves & Specular Droplets
  // 0.7s – 1.8s: Lush Multi-layered Mountain Reveal & Winding Valley Road
  // 1.4s – 2.3s: Natural, Non-Destructive Road Disruption (Moist Earth, Mist & River Slate)
  // 1.9s – 2.8s: Topographic Digital Terrain Map (Luminous GIS Contour Lines & Elevation Data)
  // 2.3s – 3.3s: Intelligent Glowing Reroute Line navigating safely around the disruption
  // 2.7s – 3.5s: Subtle Real-Time Telemetry Pulses (Weather, Hazard Report, Corridor Beacon)
  // 3.1s – 4.0s+: Digital Map Settles, NER LOGISTICS Branding & GPS Location Permission Request

  // Frame Timer
  useEffect(() => {
    const start = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const currentSeconds = (now - start) / 1000;
      setElapsed(currentSeconds);

      // Keep ticking up to 5.0s to complete all visual phases, then stay parked for user action
      if (currentSeconds < 5.0) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Graceful auto-enter countdown once branding is revealed
  useEffect(() => {
    if (elapsed < 3.4) return;
    if (autoEnterCountdown <= 0) {
      handleSkip();
      return;
    }
    const timer = setTimeout(() => {
      setAutoEnterCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [elapsed, autoEnterCountdown]);

  // Atmospheric Monsoon Rain Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const drops: { x: number; y: number; len: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 90; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 16 + Math.random() * 24,
        speed: 11 + Math.random() * 13,
        opacity: 0.14 + Math.random() * 0.2
      });
    }

    let rainAnimId: number;
    const renderRain = () => {
      ctx.clearRect(0, 0, width, height);

      // Rain streaks with natural wind slant
      ctx.lineWidth = 1.2;
      for (const d of drops) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(220, 245, 235, ${d.opacity})`;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.2, d.y + d.len);
        ctx.stroke();

        d.y += d.speed;
        d.x -= d.speed * 0.2;

        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * (width + 120);
        }
      }

      rainAnimId = requestAnimationFrame(renderRain);
    };

    renderRain();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rainAnimId);
    };
  }, []);

  // Handle requesting GPS permission
  const handleAllowLocation = async () => {
    setLocationRequested(true);
    try {
      await syncRealLocation(true);
    } catch {
      // fallback
    }
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 500);
    }, 600);
  };

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 400);
  };

  const handleSkipLocation = handleSkip;

  // Phase opacities & scale factors (fast 3–4s progression)
  // Phase 1 (0.0s – 1.2s): Macro Wildflowers & Leaves
  const phase1Opacity = elapsed < 0.9 ? 1 : Math.max(0, 1 - (elapsed - 0.9) / 0.4);
  const phase1Scale = 1 + elapsed * 0.1;

  // Phase 2 (0.7s – 4.0s): Mountain Landscape Reveal & Camera Push
  const mountainOpacity = elapsed >= 0.7 ? Math.min(1, (elapsed - 0.7) / 0.5) : 0;
  const cameraZoom = 1 + Math.max(0, elapsed - 0.7) * 0.05;

  // Phase 3 (1.4s – 4.0s): Road Disruption (Mist, Earth, Scattered Stones)
  const disruptionOpacity = elapsed >= 1.4 ? Math.min(1, (elapsed - 1.4) / 0.6) : 0;

  // Phase 4 (1.9s – 4.0s): Topographic Contour Lines (Digital Map)
  const topoOpacity = elapsed >= 1.9 ? Math.min(1, (elapsed - 1.9) / 0.6) : 0;

  // Phase 5 (2.3s – 4.0s): Glowing Intelligent Reroute Line
  const routeProgress = elapsed >= 2.3 ? Math.min(1, (elapsed - 2.3) / 0.9) : 0;

  // Phase 6 (2.7s – 4.0s): Subtle Telemetry Pulses
  const telemetryOpacity = elapsed >= 2.7 ? Math.min(1, (elapsed - 2.7) / 0.5) : 0;

  // Phase 7 (3.1s – 4.0s+): Final Branding & Title & Location Permission
  const finalBrandingOpacity = elapsed >= 3.1 ? Math.min(1, (elapsed - 3.1) / 0.7) : 0;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#190F09] select-none overflow-hidden transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Rainfall Canvas (Subtle atmospheric monsoon layer) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-none" />

      {/* ========================================================================= */}
      {/* PHASE 1: ATMOSPHERIC MACRO FOREGROUND (0.0s – 1.2s)                       */}
      {/* Detailed Wildflowers, Fresh Green Leaves & Microscopic Dew Droplets      */}
      {/* ========================================================================= */}
      {elapsed < 1.6 && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-700 pointer-events-none"
          style={{
            opacity: phase1Opacity,
            transform: `scale(${phase1Scale})`,
            transformOrigin: '50% 50%'
          }}
        >
          {/* Atmospheric monsoon forest depth backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E3B27] via-[#132A1B] to-[#0A180F]" />

          <svg className="w-full h-full" viewBox="0 0 1000 700" fill="none" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="40%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>

              <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="50%" stopColor="#16A34A" />
                <stop offset="100%" stopColor="#14532D" />
              </linearGradient>

              <linearGradient id="petalPoppy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="35%" stopColor="#60A5FA" />
                <stop offset="85%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>

              <linearGradient id="petalPrimula" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="40%" stopColor="#FECDD3" />
                <stop offset="85%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>

              <radialGradient id="dewRefraction" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E0F2FE" />
                <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0369A1" stopOpacity="0.8" />
              </radialGradient>

              <radialGradient id="dewShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              <filter id="bloomGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Soft background foliage bokeh */}
            <g opacity="0.3" filter="blur(14px)">
              <circle cx="300" cy="250" r="110" fill="#22C55E" />
              <circle cx="700" cy="300" r="130" fill="#15803D" />
              <circle cx="500" cy="200" r="90" fill="#4ADE80" />
            </g>

            {/* Left large leaf curving into frame */}
            <path
              d="M 100,700 C 260,540 380,420 420,380 C 350,350 240,380 120,510 Z"
              fill="url(#leafGrad1)"
              stroke="#86EFAC"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <path d="M 100,700 C 270,550 370,440 420,380" stroke="#86EFAC" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
            <path d="M 280,480 Q 230,465 170,485" stroke="#A7F3D0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
            <path d="M 320,445 Q 265,425 210,445" stroke="#A7F3D0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />

            {/* Right fresh mountain leaf */}
            <path
              d="M 900,710 C 740,530 620,400 580,360 C 660,330 780,360 890,490 Z"
              fill="url(#leafGrad2)"
              stroke="#86EFAC"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <path d="M 900,710 C 750,540 650,420 580,360" stroke="#86EFAC" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
            <path d="M 720,465 Q 770,450 830,470" stroke="#A7F3D0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
            <path d="M 675,430 Q 735,410 795,430" stroke="#A7F3D0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />

            {/* Secondary Wildflower: Alpine Meadow Primula (Rosy-Ivory Blossom) on Left */}
            <g transform="translate(360, 420) scale(0.72)" filter="url(#bloomGlow)">
              <path d="M 0,0 C -35,-45 -80,-30 -85,15 C -88,45 -45,55 0,0 Z" fill="url(#petalPrimula)" opacity="0.9" />
              <path d="M 0,0 C 35,-45 80,-30 85,15 C 88,45 45,55 0,0 Z" fill="url(#petalPrimula)" opacity="0.9" />
              <path d="M 0,0 C -55,20 -60,70 -15,85 C 15,95 25,60 0,0 Z" fill="url(#petalPrimula)" opacity="0.88" />
              <path d="M 0,0 C 55,20 60,70 15,85 C -15,95 -25,60 0,0 Z" fill="url(#petalPrimula)" opacity="0.88" />
              <circle cx="0" cy="0" r="10" fill="#FEF08A" />
              <circle cx="0" cy="0" r="5" fill="#F59E0B" />
            </g>

            {/* Central Wildflower: Himalayan Blue Poppy with dew */}
            <g transform="translate(500, 320)" filter="url(#bloomGlow)">
              {/* Petals */}
              <path d="M 0,0 C -40,-50 -90,-35 -95,15 C -98,50 -50,60 0,0 Z" fill="url(#petalPoppy)" opacity="0.95" />
              <path d="M 0,0 C 40,-50 90,-35 95,15 C 98,50 50,60 0,0 Z" fill="url(#petalPoppy)" opacity="0.95" />
              <path d="M 0,0 C -60,20 -70,75 -20,95 C 10,105 30,65 0,0 Z" fill="url(#petalPoppy)" opacity="0.92" />
              <path d="M 0,0 C 60,20 70,75 20,95 C -10,105 -30,65 0,0 Z" fill="url(#petalPoppy)" opacity="0.92" />
              <path d="M 0,0 C -30,-70 30,-70 0,-100 C -20,-70 -5,-35 0,0 Z" fill="url(#petalPoppy)" opacity="0.88" />

              {/* Golden pollen stamen core */}
              <circle cx="0" cy="0" r="13" fill="#FBBF24" />
              <circle cx="-3" cy="-3" r="3.5" fill="#FEF08A" />
              <circle cx="4" cy="3" r="3" fill="#FDE047" />
              <circle cx="0" cy="5" r="3" fill="#F59E0B" />
              <circle cx="-5" cy="3" r="2.5" fill="#D97706" />
            </g>

            {/* Microscopic Rain Droplets resting on leaves with bright specular shine */}
            <g>
              <ellipse cx="297" cy="457" rx="14" ry="11" fill="url(#dewShadow)" />
              <ellipse cx="295" cy="455" rx="14" ry="11" fill="url(#dewRefraction)" stroke="#FFFFFF" strokeWidth="0.8" />
              <ellipse cx="291" cy="451" rx="4" ry="2.5" fill="#FFFFFF" />
            </g>
            <g>
              <circle cx="452" cy="312" r="8" fill="url(#dewShadow)" />
              <circle cx="450" cy="310" r="8" fill="url(#dewRefraction)" stroke="#FFFFFF" strokeWidth="0.8" />
              <circle cx="448" cy="308" r="2.2" fill="#FFFFFF" />
            </g>
            <g>
              <ellipse cx="642" cy="422" rx="12" ry="9" fill="url(#dewShadow)" />
              <ellipse cx="640" cy="420" rx="12" ry="9" fill="url(#dewRefraction)" stroke="#FFFFFF" strokeWidth="0.8" />
              <ellipse cx="637" cy="417" rx="3.5" ry="2" fill="#FFFFFF" />
            </g>
            {/* Elongating Droplet at Leaf Tip that falls as camera pushes */}
            <g transform={`translate(420, ${380 + (elapsed > 0.5 ? (elapsed - 0.5) * 200 : 0)})`}>
              <ellipse cx="0" cy="0" rx="10" ry={elapsed > 0.5 ? 15 : 10} fill="url(#dewRefraction)" stroke="#FFFFFF" strokeWidth="0.8" />
              <circle cx="-2.5" cy="-2.5" r="2" fill="#FFFFFF" />
            </g>
            <circle cx="360" cy="420" r="4.5" fill="url(#dewRefraction)" />
            <circle cx="560" cy="365" r="5" fill="url(#dewRefraction)" />
            <circle cx="760" cy="445" r="5.5" fill="url(#dewRefraction)" />
          </svg>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2 - 7: MOUNTAIN REVEAL, ROAD, DISRUPTION, TOPO & REROUTING          */}
      {/* ========================================================================= */}
      {elapsed >= 0.6 && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-700 pointer-events-none"
          style={{
            opacity: mountainOpacity,
            transform: `scale(${cameraZoom})`,
            transformOrigin: '50% 50%'
          }}
        >
          {/* Atmospheric sky - Monsoon daylight through mist */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B4C38] via-[#1A3324] to-[#0D1C13]" />

          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Vibrant Lush Mountain Ridges */}
              <linearGradient id="ridgeDistant" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4D7C5F" />
                <stop offset="100%" stopColor="#254B35" />
              </linearGradient>

              <linearGradient id="ridgeMid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#366B47" />
                <stop offset="100%" stopColor="#1B3D27" />
              </linearGradient>

              <linearGradient id="ridgeFore" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#224C31" />
                <stop offset="100%" stopColor="#0F2416" />
              </linearGradient>

              {/* Reroute Stream Luminous Gradient */}
              <linearGradient id="neonRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="60%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>

              <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* FAR MOUNTAIN RIDGES */}
            <path
              d="M -100,380 Q 180,210 420,290 T 840,240 Q 1040,190 1300,350 L 1300,800 L -100,800 Z"
              fill="url(#ridgeDistant)"
              opacity="0.8"
            />

            {/* DRIFTING VALLEY MIST LAYER 1 */}
            <path
              d="M -50,420 Q 250,350 550,390 T 1150,360 L 1150,480 L -50,480 Z"
              fill="rgba(220, 245, 235, 0.22)"
              filter="blur(16px)"
            />

            {/* MID-GROUND LUSH MOUNTAIN RIDGES */}
            <path
              d="M -50,480 Q 240,310 500,400 T 960,330 Q 1100,360 1250,460 L 1250,800 L -50,800 Z"
              fill="url(#ridgeMid)"
            />

            {/* DRIFTING VALLEY MIST LAYER 2 */}
            <ellipse
              cx="620"
              cy="450"
              rx="580"
              ry="50"
              fill="rgba(230, 250, 240, 0.24)"
              filter="blur(22px)"
            />

            {/* FOREGROUND MOUNTAIN SLOPES */}
            <path
              d="M -50,590 Q 280,430 540,500 T 1020,460 L 1250,590 L 1250,800 L -50,800 Z"
              fill="url(#ridgeFore)"
            />

            {/* =================================================================== */}
            {/* WINDING MOUNTAIN ROAD (Crisp, High-Contrast Silver-Gray Ribbon)     */}
            {/* =================================================================== */}
            {/* Section 1: Approach Road */}
            <path
              d="M 100,710 Q 260,670 380,600 T 530,535"
              stroke="#CBD5E1"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            {/* Section 2: Disrupted Road Segment */}
            <path
              d="M 530,535 Q 600,505 670,475"
              stroke="#CBD5E1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={disruptionOpacity > 0.4 ? "5 5" : "none"}
              fill="none"
              opacity={Math.max(0.2, 0.9 - disruptionOpacity * 0.75)}
            />

            {/* Section 3: Continuing Road */}
            <path
              d="M 670,475 Q 770,445 910,395 T 1100,350"
              stroke="#CBD5E1"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />

            {/* =================================================================== */}
            {/* PHASE 3: NATURAL ROAD DISRUPTION (Moist Earth & Scattered Stones)   */}
            {/* =================================================================== */}
            {disruptionOpacity > 0 && (
              <g opacity={disruptionOpacity}>
                {/* Natural settled earth veil */}
                <ellipse cx="600" cy="505" rx="75" ry="26" fill="#543A24" opacity="0.85" filter="blur(6px)" />
                <ellipse cx="605" cy="500" rx="45" ry="16" fill="#3D2817" opacity="0.9" filter="blur(3px)" />

                {/* Scattered slate river rocks */}
                <circle cx="578" cy="510" r="4.2" fill="#78716C" />
                <circle cx="592" cy="502" r="5.2" fill="#57534E" />
                <circle cx="610" cy="508" r="3.5" fill="#8C7E6C" />
                <circle cx="624" cy="498" r="4.5" fill="#44403C" />
                <circle cx="636" cy="512" r="3" fill="#6B5B49" />

                {/* Soft curl of mountain mist */}
                <ellipse cx="600" cy="495" rx="90" ry="28" fill="rgba(230, 250, 242, 0.35)" filter="blur(10px)" />
              </g>
            )}

            {/* =================================================================== */}
            {/* PHASE 4: DELICATE TOPOGRAPHIC CONTOURS (Digital Terrain Map)        */}
            {/* =================================================================== */}
            {topoOpacity > 0 && (
              <g opacity={topoOpacity}>
                <g stroke="#6EE7B7" strokeWidth="1.2" strokeOpacity="0.7" fill="none">
                  <path d="M 0,360 Q 200,260 400,320 T 800,270 T 1200,330" />
                  <path d="M 0,390 Q 210,290 420,340 T 820,300 T 1200,360" />
                  <path d="M 0,420 Q 220,320 440,370 T 840,330 T 1200,390" />
                  <path d="M 0,470 Q 250,360 500,440 T 950,380 T 1200,450" />
                  <path d="M 0,500 Q 260,390 520,470 T 970,410 T 1200,480" />
                  <path d="M 0,530 Q 270,420 540,500 T 990,440 T 1200,510" />
                  <path d="M 80,620 Q 300,500 540,550 T 1030,510 T 1200,570" />
                  <path d="M 100,650 Q 320,530 560,580 T 1050,540 T 1200,600" />
                </g>

                {/* Elevation Indicators in High-Tech Monospace */}
                <g fill="#A7F3D0" fontSize="10" fontFamily="monospace" opacity="0.85">
                  <text x="180" y="380">2,450m</text>
                  <text x="460" y="335">2,100m</text>
                  <text x="830" y="295">1,820m</text>
                  <text x="280" y="525">1,450m</text>
                  <text x="750" y="435">1,180m</text>
                </g>
              </g>
            )}

            {/* =================================================================== */}
            {/* PHASE 5: INTELLIGENT GLOWING REROUTE LINE                           */}
            {/* =================================================================== */}
            {routeProgress > 0 && (
              <g>
                {/* Main Glowing Path */}
                <path
                  d="M 520,538 Q 560,578 615,582 T 670,535 Q 695,495 725,465"
                  stroke="url(#neonRoute)"
                  strokeWidth="4.8"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonGlow)"
                  strokeDasharray="260"
                  strokeDashoffset={260 * (1 - routeProgress)}
                />

                {/* Soft Glowing Aura */}
                <path
                  d="M 520,538 Q 560,578 615,582 T 670,535 Q 695,495 725,465"
                  stroke="rgba(52, 211, 153, 0.65)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  filter="blur(7px)"
                  strokeDasharray="260"
                  strokeDashoffset={260 * (1 - routeProgress)}
                />

                {/* Tracer light head */}
                {routeProgress < 0.98 && (
                  <circle
                    cx={520 + routeProgress * 205}
                    cy={538 + Math.sin(routeProgress * Math.PI) * 40 - routeProgress * 73}
                    r="5.5"
                    fill="#FFFFFF"
                    filter="url(#neonGlow)"
                  />
                )}
              </g>
            )}

            {/* =================================================================== */}
            {/* PHASE 6: SUBTLE REAL-TIME TELEMETRY PULSES                          */}
            {/* =================================================================== */}
            {telemetryOpacity > 0 && (
              <g opacity={telemetryOpacity}>
                {/* 1. Weather monitoring point on crest */}
                <g transform="translate(460, 390)">
                  <circle cx="0" cy="0" r="3.5" fill="#5EEAD4" />
                  <circle cx="0" cy="0" r="10" stroke="#5EEAD4" strokeWidth="1.2" fill="none" opacity="0.8" className="animate-ping" />
                  <rect x="8" y="-14" width="88" height="18" rx="4" fill="#190F09" opacity="0.85" />
                  <text x="12" y="-2" fill="#BAE6FD" fontSize="9" fontFamily="monospace">AWS-04 • 12mm/h</text>
                </g>

                {/* 2. Road hazard report at junction */}
                <g transform="translate(575, 574)">
                  <circle cx="0" cy="0" r="3.5" fill="#FDE047" />
                  <circle cx="0" cy="0" r="11" stroke="#FDE047" strokeWidth="1.2" fill="none" opacity="0.8" className="animate-ping" />
                  <rect x="10" y="-14" width="105" height="18" rx="4" fill="#190F09" opacity="0.85" />
                  <text x="14" y="-2" fill="#FDE047" fontSize="9" fontFamily="monospace">HAZARD • Landslide</text>
                </g>

                {/* 3. Emergency safe corridor pulse */}
                <g transform="translate(725, 465)">
                  <circle cx="0" cy="0" r="4" fill="#34D399" />
                  <circle cx="0" cy="0" r="14" stroke="#6EE7B7" strokeWidth="1.5" fill="none" opacity="0.8" className="animate-ping" />
                  <rect x="10" y="-14" width="115" height="18" rx="4" fill="#190F09" opacity="0.85" />
                  <text x="14" y="-2" fill="#A7F3D0" fontSize="9" fontFamily="monospace">SAFE BYPASS • 42km/h</text>
                </g>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL FRAME & BRANDING: NER LOGISTICS / Northeast Route Intelligence      */}
      {/* AND Location Permission Request Card                                      */}
      {/* ========================================================================= */}
      {finalBrandingOpacity > 0 && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 transition-opacity duration-700 pointer-events-auto"
          style={{ opacity: finalBrandingOpacity }}
        >
          {/* Ambient luminous glow behind card */}
          <div className="absolute w-[520px] h-[520px] rounded-full bg-[#10B981]/15 filter blur-3xl pointer-events-none" />

          {/* Central Emblem & Title Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-[#190F09]/95 border-2 border-[#10B981] flex items-center justify-center shadow-2xl mb-4 backdrop-blur-md">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3,17 L 8,10 L 12,14 L 16,7 L 21,17 Z"
                  stroke="#6EE7B7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 5,17 C 8,13 14,13 19,17"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="14" r="2.5" fill="#34D399" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.28em] text-[#F8F2EA] uppercase font-sans">
              NER LOGISTICS
            </h1>

            <p className="mt-2 text-sm sm:text-base font-medium tracking-[0.2em] text-[#A7F3D0] italic">
              Northeast Route Intelligence
            </p>
          </div>

          {/* Location Permission Request Card */}
          <div className="w-full max-w-md rounded-2xl bg-[#251810]/95 border border-[#3B281C] p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399] shrink-0 mt-0.5">
                <Navigation className={`h-5 w-5 ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#F8F2EA]">
                  Enable Real-Time GPS Location
                </h3>
                <p className="text-xs text-[#DAC0A9] mt-1 leading-relaxed">
                  Allow location access so NER Logistics can calculate dynamic landslide detours and sync terrain safety for your current coordinates.
                </p>
              </div>
            </div>

            {/* GPS Fix Status */}
            {userLocation && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#190F09]/80 border border-[#10B981]/40 text-xs text-[#34D399] font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                  <span>GPS Synced: {userLocation.latitude.toFixed(2)}°N, {userLocation.longitude.toFixed(2)}°E</span>
                </div>
                <span className="text-[10px] text-[#A7F3D0] font-bold">±{userLocation.accuracy}m</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={isLocating}
                className="w-full flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition shadow-lg disabled:opacity-50"
              >
                <MapPin className="h-4 w-4" />
                <span>{isLocating ? 'Acquiring Fix...' : 'Allow Location Access'}</span>
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-[#190F09] hover:bg-[#190F09]/80 border border-[#3B281C] text-xs font-semibold text-[#DAC0A9] hover:text-[#F8F2EA] transition"
              >
                Continue (Regional Hub)
              </button>
            </div>

            {/* Auto-enter indicator */}
            <div className="flex items-center justify-between pt-1 border-t border-[#3B281C]/60 text-[11px] text-[#DAC0A9]/60 font-mono">
              <span>Auto-entering in {autoEnterCountdown}s...</span>
              <button
                type="button"
                onClick={handleSkip}
                className="text-[#34D399] hover:underline font-semibold"
              >
                Enter Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foreground Wildflowers subtly framing the lower screen */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none opacity-40 bg-gradient-to-t from-[#190F09] to-transparent z-20" />
    </div>
  );
};

"use client";

import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import "./ProfileCard.css";

interface ProfileCardProps {
  avatarUrl: string;
  iconUrl?: string;     // pattern (mask)
  grainUrl?: string;    // grain texture
  innerGradient?: string;

  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;

  className?: string;

  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;

  miniAvatarUrl?: string;

  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;

  showUserInfo?: boolean;
  onContactClick?: () => void;
}

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg, rgba(16,24,48,0.75) 0%, rgba(20,90,160,0.18) 100%)";

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 900,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 160,
} as const;

const clamp = (v: number, min = 0, max = 100): number =>
  Math.min(Math.max(v, min), max);

const round = (v: number, precision = 3): number =>
  parseFloat(v.toFixed(precision));

const adjust = (
  v: number,
  fMin: number,
  fMax: number,
  tMin: number,
  tMax: number
): number => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  innerGradient,

  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,

  className = "",

  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,

  miniAvatarUrl,

  name = "Javi A. Torres",
  title = "Software Engineer",
  handle = "javicodes",
  status = "Online",
  contactText = "Contact Me",

  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<number | null>(null);

  const [miniSrc, setMiniSrc] = useState(miniAvatarUrl || avatarUrl);
  const [miniFailed, setMiniFailed] = useState(false);

  useEffect(() => {
    setMiniSrc(miniAvatarUrl || avatarUrl);
    setMiniFailed(false);
  }, [miniAvatarUrl, avatarUrl]);

  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.55;
    let initialUntil = 0;

    const setVarsFromXY = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;

      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(
          Math.hypot(percentY - 50, percentX - 50) / 50,
          0,
          1
        )}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      } as Record<string, string>;

      for (const [k, v] of Object.entries(properties)) {
        wrap.style.setProperty(k, v);
      }
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      running = false;
      lastTs = 0;
    };

    const step = (ts: number) => {
      if (!running) return;

      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);

      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;

      setVarsFromXY(currentX, currentY);

      const stillFar =
        Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08;

      if (stillFar) {
        rafId = requestAnimationFrame(step);
      } else {
        stop();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x: number, y: number) {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x: number, y: number) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs: number) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      cancel() {
        stop();
      },
    };
  }, [enableTilt]);

  const getOffsets = (evt: PointerEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent) => {
      const wrap = wrapRef.current;
      const shell = shellRef.current;
      if (!wrap || !shell || !tiltEngine) return;

      wrap.classList.add("active");
      shell.classList.add("active");

      shell.classList.add("entering");
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => {
        shell.classList.remove("entering");
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerLeave = useCallback(() => {
    const wrap = wrapRef.current;
    const shell = shellRef.current;
    if (!wrap || !shell || !tiltEngine) return;

    wrap.classList.remove("active");
    shell.classList.remove("active");
    tiltEngine.toCenter();
  }, [tiltEngine]);

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      const { beta, gamma } = event;
      if (beta == null || gamma == null) return;

      const centerX = shell.clientWidth / 2;
      const centerY = shell.clientHeight / 2;

      const x = clamp(centerX + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
      const y = clamp(
        centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        0,
        shell.clientHeight
      );

      tiltEngine.setTarget(x, y);
    },
    [tiltEngine, mobileTiltSensitivity]
  );

  useEffect(() => {
    if (!enableTilt || !tiltEngine) return;

    const shell = shellRef.current;
    if (!shell) return;

    const deviceOrientationHandler = handleDeviceOrientation as EventListener;

    const handleClick = () => {
      if (!enableMobileTilt || location.protocol !== "https:") return;

      const DeviceMotion = window.DeviceMotionEvent as
        | DeviceMotionEventWithPermission
        | undefined;

      if (DeviceMotion?.requestPermission) {
        DeviceMotion.requestPermission()
          .then((state) => {
            if (state === "granted") {
              window.addEventListener("deviceorientation", deviceOrientationHandler);
            }
          })
          .catch(() => {});
      } else {
        window.addEventListener("deviceorientation", deviceOrientationHandler);
      }
    };

    shell.addEventListener("click", handleClick);

    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    return () => {
      shell.removeEventListener("click", handleClick);
      window.removeEventListener("deviceorientation", deviceOrientationHandler);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      tiltEngine.cancel();
      shell.classList.remove("entering");
      shell.classList.remove("active");
      wrapRef.current?.classList.remove("active");
    };
  }, [enableTilt, enableMobileTilt, tiltEngine, handleDeviceOrientation]);

  const cardStyle = useMemo(
    () =>
      ({
        "--icon": iconUrl ? `url(${iconUrl})` : "none",
        "--grain": grainUrl ? `url(${grainUrl})` : "none",
        "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
        "--behind-glow-color": behindGlowColor ?? "rgba(80, 160, 255, 0.55)",
        "--behind-glow-size": behindGlowSize ?? "55%",
      }) as React.CSSProperties,
    [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize]
  );

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`.trim()} style={cardStyle}>
      {behindGlowEnabled && <div className="pc-behind" />}

      <div
        ref={shellRef}
        className="pc-card-shell"
        onPointerEnter={(e) => handlePointerEnter(e.nativeEvent)}
        onPointerMove={(e) => handlePointerMove(e.nativeEvent)}
        onPointerLeave={() => handlePointerLeave()}
      >
        <section className="pc-card">
          <div className="pc-inside">
            {/* AVATAR + OVERLAYS */}
            <div className="pc-content pc-avatar-content" aria-hidden="true">
              <div className="pc-avatar-layer">
                <Image
                  src={avatarUrl}
                  alt={`${name || "User"} avatar`}
                  fill
                  sizes="(max-width: 768px) 70vw, 420px"
                  className="avatar"
                  priority
                />
              </div>

              {/* Azuleado + vignette */}
              <div className="pc-layer pc-tint" aria-hidden="true" />
              <div className="pc-layer pc-vignette" aria-hidden="true" />

              {/* Pattern base + wave */}
              <div className="pc-layer pc-pattern" aria-hidden="true" />
              <div className="pc-layer pc-wave" aria-hidden="true" />

              {/* Grain + shine + glare */}
              <div className="pc-layer pc-grain" aria-hidden="true" />
              <div className="pc-layer pc-shine" aria-hidden="true" />
              <div className="pc-layer pc-glare" aria-hidden="true" />

              {showUserInfo && (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      <Image
                        src={miniSrc}
                        alt={`${name || "User"} mini avatar`}
                        width={48}
                        height={48}
                        className={`pc-mini-avatar-img ${miniFailed ? "is-fallback" : ""}`}
                        onError={() => {
                          if (miniSrc !== avatarUrl) setMiniSrc(avatarUrl);
                          setMiniFailed(true);
                        }}
                      />
                    </div>

                    <div className="pc-user-text">
                      <div className="pc-handle">@{handle}</div>
                      <div className="pc-status">{status}</div>
                    </div>
                  </div>

                  <button
                    className="pc-contact-btn"
                    onClick={() => onContactClick?.()}
                    type="button"
                    aria-label={`Contact ${name || "user"}`}
                  >
                    {contactText}
                  </button>
                </div>
              )}
            </div>

            {/* TEXTO */}
            <div className="pc-content pc-toptext">
              <div className="pc-details">
                <h3>{name}</h3>
                <p>{title}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;

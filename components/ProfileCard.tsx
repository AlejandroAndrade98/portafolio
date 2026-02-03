"use client";

import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import "./ProfileCard.css";

interface ProfileCardProps {
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
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

  name = "Alejandro Andrade",
  title = "Software Developer",
  handle = "alejandroandrade",
  status = "Online",
  contactText = "Contact Me",

  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastXYRef = useRef<{ x: number; y: number } | null>(null);

  const [miniSrc, setMiniSrc] = useState(miniAvatarUrl || avatarUrl);
  const [miniFailed, setMiniFailed] = useState(false);

  useEffect(() => {
    setMiniSrc(miniAvatarUrl || avatarUrl);
    setMiniFailed(false);
  }, [miniAvatarUrl, avatarUrl]);

  /**
   * ✅ TILT ENGINE (sin loops, sin layout thrash)
   */
  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;

    let running = false;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const setVars = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;

      const w = shell.clientWidth || 1;
      const h = shell.clientHeight || 1;

      const px = clamp((100 / w) * x);
      const py = clamp((100 / h) * y);

      wrap.style.setProperty("--pointer-x", `${px}%`);
      wrap.style.setProperty("--pointer-y", `${py}%`);
      wrap.style.setProperty("--background-x", `${adjust(px, 0, 100, 35, 65)}%`);
      wrap.style.setProperty("--background-y", `${adjust(py, 0, 100, 35, 65)}%`);
      wrap.style.setProperty(
        "--rotate-x",
        `${round(-(px - 50) / 5)}deg`
      );
      wrap.style.setProperty(
        "--rotate-y",
        `${round((py - 50) / 4)}deg`
      );
    };

    const step = () => {
      if (!running) return;

      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      setVars(currentX, currentY);

      if (
        Math.abs(targetX - currentX) < 0.3 &&
        Math.abs(targetY - currentY) < 0.3
      ) {
        running = false;
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    return {
      setTarget(x: number, y: number) {
        if (
          lastXYRef.current &&
          Math.abs(lastXYRef.current.x - x) < 1 &&
          Math.abs(lastXYRef.current.y - y) < 1
        ) {
          return;
        }

        lastXYRef.current = { x, y };
        targetX = x;
        targetY = y;

        if (!running) {
          running = true;
          rafRef.current = requestAnimationFrame(step);
        }
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      stop() {
        running = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      },
    };
  }, [enableTilt]);

  const getOffsets = (evt: PointerEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!tiltEngine || !shellRef.current) return;
      const { x, y } = getOffsets(e.nativeEvent, shellRef.current);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerLeave = useCallback(() => {
    tiltEngine?.toCenter();
  }, [tiltEngine]);

  useEffect(() => {
    return () => {
      tiltEngine?.stop();
    };
  }, [tiltEngine]);

  const cardStyle = useMemo(
    () =>
      ({
        "--icon": iconUrl ? `url(${iconUrl})` : "none",
        "--grain": grainUrl ? `url(${grainUrl})` : "none",
        "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
        "--behind-glow-color": behindGlowColor ?? "rgba(80,160,255,0.55)",
        "--behind-glow-size": behindGlowSize ?? "55%",
      }) as React.CSSProperties,
    [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize]
  );

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
    >
      {behindGlowEnabled && <div className="pc-behind" />}

      <div
        ref={shellRef}
        className="pc-card-shell"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <section className="pc-card">
          <div className="pc-inside">
            <div className="pc-content pc-avatar-content">
              <div className="pc-avatar-layer">
                <Image
                  src={avatarUrl}
                  alt={`${name} avatar`}
                  fill
                  sizes="420px"
                  className="avatar"
                  priority
                />
              </div>

              <div className="pc-layer pc-tint" />
              <div className="pc-layer pc-vignette" />
              <div className="pc-layer pc-pattern" />
              <div className="pc-layer pc-wave" />
              <div className="pc-layer pc-grain" />
              <div className="pc-layer pc-shine" />
              <div className="pc-layer pc-glare" />

              {showUserInfo && (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      <Image
                        src={miniSrc}
                        alt="mini avatar"
                        width={48}
                        height={48}
                        className="pc-mini-avatar-img"
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
                  >
                    {contactText}
                  </button>
                </div>
              )}
            </div>

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

export default React.memo(ProfileCardComponent);

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Skiper 40 Animated Links (CssLink) — Skiper UI Official Integration
 * Lightweight, GPU-accelerated CSS-animated links with arrow hover effects and reduced-motion support.
 * @see https://skiper-ui.com/r/skiper40.json
 */

interface SkiperLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href?: string;
  to?: string;
  className?: string;
  showArrow?: boolean;
}

export const Link001: React.FC<SkiperLinkProps> = ({
  children,
  href,
  to,
  className = '',
  showArrow = true,
  style,
  ...props
}) => {
  const isInternal = Boolean(to && !href);
  const targetPath = to || href || '#';

  const content = (
    <>
      <span className="skiper-link-text">{children}</span>
      {showArrow && (
        <svg
          className="skiper-link-arrow"
          fill="none"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (isInternal) {
    return (
      <RouterLink
        to={targetPath}
        className={`skiper-link skiper-link-001 ${className}`}
        style={style}
      >
        {content}
      </RouterLink>
    );
  }

  return (
    <a
      href={targetPath}
      className={`skiper-link skiper-link-001 ${className}`}
      style={style}
      {...props}
    >
      {content}
    </a>
  );
};

export const Link003: React.FC<SkiperLinkProps> = ({
  children,
  href,
  to,
  className = '',
  showArrow = false,
  style,
  ...props
}) => {
  const isInternal = Boolean(to && !href);
  const targetPath = to || href || '#';

  const content = (
    <>
      <span className="skiper-link-text">{children}</span>
      {showArrow && (
        <svg
          className="skiper-link-arrow"
          fill="none"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (isInternal) {
    return (
      <RouterLink
        to={targetPath}
        className={`skiper-link skiper-link-003 ${className}`}
        style={style}
      >
        {content}
      </RouterLink>
    );
  }

  return (
    <a
      href={targetPath}
      className={`skiper-link skiper-link-003 ${className}`}
      style={style}
      {...props}
    >
      {content}
    </a>
  );
};

export const Skiper40: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Link001 to="/dashboard">Explore Dashboard</Link001>
      <Link003 to="/apps">View All Modules</Link003>
    </div>
  );
};

export default Link001;

import React from 'react';

// Path to the official ALBAB Islamic University seal (public asset)
export const ALBAB_LOGO_SRC = '/images/albab-logo.jpeg';

interface AlbabLogoProps {
  className?: string;
  size?: number;
}

/**
 * Official ALBAB Islamic University logo.
 * The source photo is cropped to a perfect circle around the seal
 * so it can be used at any size with a transparent surround.
 */
export default function AlbabLogo({ className = 'h-12 w-12', size }: AlbabLogoProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-md select-none`}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="ALBAB Islamic University logo"
    >
      <defs>
        <clipPath id="albab-logo-circle-clip">
          <circle cx="250" cy="250" r="249" />
        </clipPath>
      </defs>

      {/* Zoomed and positioned so the circular seal fills the frame exactly */}
      <image
        href={ALBAB_LOGO_SRC}
        x="-37"
        y="-28"
        width="574"
        height="551"
        clipPath="url(#albab-logo-circle-clip)"
        preserveAspectRatio="none"
      />
    </svg>
  );
}

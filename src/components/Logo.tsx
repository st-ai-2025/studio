import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="url(#paint0_linear_101_2)" />
      <path
        d="M19.3333 7.33331H12.6667C9.6269 7.33331 7.33334 9.62688 7.33334 12.6666V15.9999C7.33334 19.0397 9.6269 21.3333 12.6667 21.3333H13.3333"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6667 24.6667H19.3333C22.3731 24.6667 24.6667 22.3731 24.6667 19.3334V16.0001C24.6667 12.9603 22.3731 10.6667 19.3333 10.6667H18.6667"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_101_2"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#64B5F6" />
          <stop offset="1" stopColor="#81C784" />
        </linearGradient>
      </defs>
    </svg>
  );
}

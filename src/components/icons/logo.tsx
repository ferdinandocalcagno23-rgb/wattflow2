export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l4 12h4l4-12" />
      <path d="M12 4v16" />
      <path d="M16 4l4 12h4" />
      <path d="M8 12h12" />
    </svg>
  );
}

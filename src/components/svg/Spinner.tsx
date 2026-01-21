export const Spinner = ({ width = "2em", height = "2em", color = "white" }: { width?: string; height?: string; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
    <circle cx="10" cy="10" r="9" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
    <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="14 42">
      <animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite" />
    </circle>
  </svg>
);

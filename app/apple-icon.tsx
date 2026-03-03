import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1c1917",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#f59e0b",
            fontSize: 80,
            fontWeight: "bold",
            fontFamily: "serif",
            lineHeight: 1,
            letterSpacing: "-3px",
          }}
        >
          SB
        </div>
      </div>
    ),
    { ...size }
  );
}

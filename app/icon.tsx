import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
            fontSize: 220,
            fontWeight: "bold",
            fontFamily: "serif",
            lineHeight: 1,
            letterSpacing: "-8px",
          }}
        >
          SB
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Sync — Cine en casa entre amigos"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          position: "relative",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #E5283B 0%, #B21030 50%, #7A0C1B 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "44px",
          }}
        >
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "40px",
              background: "linear-gradient(155deg, #E5283B 0%, #B21030 65%, #7A0C1B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 48px rgba(229, 40, 59, 0.24)",
            }}
          >
            <svg
              width="108"
              height="108"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle cx="62" cy="42" r="24" stroke="#FFF8F6" strokeWidth="7" fill="none" />
              <circle cx="38" cy="54" r="21" fill="#FFF8F6" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "124px",
                  fontWeight: 900,
                  color: "#140A0C",
                  letterSpacing: "-4.5px",
                  lineHeight: 1,
                }}
              >
                sync
              </span>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#FF6B7A",
                  boxShadow: "0 0 12px rgba(255, 107, 122, 0.7)",
                  marginTop: "-50px",
                }}
              />
            </div>

            <span
              style={{
                fontSize: "32px",
                fontWeight: 500,
                color: "#7A5A5D",
                letterSpacing: "-0.6px",
                marginTop: "12px",
              }}
            >
              Cine en casa entre amigos
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

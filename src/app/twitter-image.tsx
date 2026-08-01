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
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "#E5283B",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "42px",
          }}
        >
          <div
            style={{
              width: "170px",
              height: "170px",
              borderRadius: "38px",
              background: "linear-gradient(135deg, #E5283B 0%, #B21030 65%, #7A0C1B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 40px rgba(229, 40, 59, 0.22), 0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
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
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "115px",
                  fontWeight: 900,
                  color: "#140A0C",
                  letterSpacing: "-4px",
                  lineHeight: 1,
                }}
              >
                sync
              </span>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#E5283B",
                  marginTop: "-45px",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "30px",
                fontWeight: 500,
                color: "#7A686C",
                letterSpacing: "-0.5px",
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

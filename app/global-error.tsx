"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Red Creativa Pro</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "90%",
            padding: "32px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "32px",
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#ffffff",
            }}
          >
            ¡Oops! Algo salió mal
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: "24px",
              lineHeight: "1.6",
            }}
          >
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={reset}
              style={{
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "600",
                background: "#f97316",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#ea580c")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#f97316")}
            >
              🔄 Intentar de nuevo
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "600",
                background: "transparent",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              🏠 Ir al inicio
            </button>
          </div>
          {error.digest && (
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.4)",
                marginTop: "24px",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}

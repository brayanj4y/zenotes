import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "var(--font-sans)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "var(--tw-prose-body)",
            lineHeight: "1.5",
            h1: {
              marginTop: "1.5rem",
              marginBottom: "1rem",
              fontSize: "1.875rem",
              fontWeight: "500",
              lineHeight: "1.2",
            },
            h2: {
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
              fontSize: "1.5rem",
              fontWeight: "500",
              lineHeight: "1.25",
            },
            h3: {
              marginTop: "1.25rem",
              marginBottom: "0.75rem",
              fontSize: "1.25rem",
              fontWeight: "500",
              lineHeight: "1.3",
            },
            p: {
              marginTop: "0.75rem",
              marginBottom: "0.75rem",
            },
            a: {
              color: "#00FFFF",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            blockquote: {
              borderLeftColor: "#eaeaea",
              borderLeftWidth: "2px",
              paddingLeft: "1rem",
              fontStyle: "normal",
              color: "var(--tw-prose-quotes)",
            },
            code: {
              color: "var(--tw-prose-code)",
              fontWeight: "400",
              backgroundColor: "#f8f9fa",
              borderRadius: "0.25rem",
              padding: "0.125rem 0.25rem",
            },
            pre: {
              backgroundColor: "#f8f9fa",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              overflowX: "auto",
            },
            img: {
              borderRadius: "0.375rem",
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config

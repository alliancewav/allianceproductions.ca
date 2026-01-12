# Alliance Productions

Modern landing page for Alliance Productions Records Inc. - a professional recording studio based in Montreal.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS 3.4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Runtime**: Node.js 22 LTS

## Getting Started

### Development

```bash
npm install
npm run dev
```

The development server will start at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

The production server uses the `PORT` environment variable (defaults to 3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with fonts and metadata
│   ├── page.tsx        # Main landing page
│   └── globals.css     # Global styles and Tailwind config
└── components/
    ├── Hero.tsx        # Hero section with animated text
    ├── Features.tsx    # Feature cards grid
    ├── Mission.tsx     # Mission statement with parallax
    ├── FAQ.tsx         # FAQ accordion
    └── Footer.tsx      # Footer with CTAs
```

## Design System

- **Primary Color**: #FF1100 (AP Red)
- **Background**: #0A0A0A (Deep Black)
- **Typography**: Bebas Neue (Display) + Outfit (Body)

## External Links

- Booking: https://alliancewav.fibery.io/@public/forms/1TnEtzud
- Beats: https://open.beatpass.ca/

## Deployment

The site is configured to run behind nginx proxy in CloudPanel. Ensure the `app_port` in the vhost configuration matches the PORT environment variable.

---

© Alliance Productions Records Inc. - Trusted in the music industry since 2020.

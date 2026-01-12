# Alliance Productions

Official website for Alliance Productions Records Inc. - a professional recording studio based in Montreal.

**Live site:** [allianceproductions.ca](https://allianceproductions.ca)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS 3.4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Runtime**: Node.js 22 LTS

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your credentials
3. Install dependencies and build:

```bash
npm install
npm run build
npm run start
```

## Environment Variables

See `.env.example` for required environment variables (email configuration for booking form).

## Project Structure

```
src/
├── app/
│   ├── api/booking/    # Booking form API endpoint
│   ├── privacy/        # Privacy policy page
│   ├── layout.tsx      # Root layout with fonts and metadata
│   ├── page.tsx        # Main landing page
│   ├── not-found.tsx   # 404 page
│   └── globals.css     # Global styles
└── components/
    ├── Hero.tsx        # Hero section with animated text
    ├── Navbar.tsx      # Navigation bar
    ├── Features.tsx    # Feature cards grid
    ├── Pricing.tsx     # Studio pricing packages
    ├── HowItWorks.tsx  # Booking process steps
    ├── BeatPass.tsx    # BeatPass integration section
    ├── Mission.tsx     # Mission statement
    ├── FAQ.tsx         # FAQ accordion
    ├── Footer.tsx      # Footer with social links
    ├── BookingModal.tsx      # Studio booking modal
    ├── BookingContext.tsx    # Booking state management
    ├── CookieConsent.tsx     # Cookie consent banner
    └── BackToTop.tsx         # Scroll to top button
```

## Design System

- **Primary Color**: #FF1100 (AP Red)
- **Background**: #0A0A0A (Deep Black)
- **Typography**: Bebas Neue (Display) + Outfit (Body)

## Deployment

The site runs on CloudPanel with PM2 behind an nginx reverse proxy.

```bash
npm run build
pm2 restart alliance-productions
```

---

© Alliance Productions Records Inc.

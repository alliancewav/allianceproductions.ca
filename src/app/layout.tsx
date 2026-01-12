import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Outfit } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { BookingProvider } from '@/components/BookingContext'
import CookieConsent from '@/components/CookieConsent'
import Navbar from '@/components/Navbar'
import GlobalBookingModal from '@/components/GlobalBookingModal'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://allianceproductions.ca'),
  title: {
    default: 'Alliance Productions | Montreal Recording Studio & Music Production',
    template: '%s | Alliance Productions'
  },
  description: 'Professional recording studio in Montreal offering music production, custom beats, vocal tracking, mixing & mastering, and live instrument sessions. Women-owned since 2020. Book your session today.',
  keywords: ['recording studio Montreal', 'Montreal music production', 'mixing and mastering', 'beat production', 'vocal recording studio', 'professional recording', 'music studio Quebec', 'studio denregistrement Montreal', 'hip hop studio', 'R&B recording'],
  authors: [{ name: 'Alliance Productions Records Inc.' }],
  creator: 'Alliance Productions',
  publisher: 'Alliance Productions Records Inc.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://allianceproductions.ca',
  },
  openGraph: {
    title: 'Alliance Productions | Montreal Recording Studio & Music Production',
    description: 'Professional recording studio in Montreal. Music production, custom beats, vocal tracking, mixing & mastering. Women-owned since 2020.',
    url: 'https://allianceproductions.ca',
    siteName: 'Alliance Productions',
    locale: 'en_CA',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Alliance Productions Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alliance Productions | Montreal Recording Studio',
    description: 'Professional recording studio in Montreal. Music production, mixing & mastering, custom beats.',
    site: '@Alliancewav',
    creator: '@Alliancewav',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/AP-logo-square.jpg',
    apple: '/AP-logo-square.jpg',
  },
  other: {
    'geo.region': 'CA-QC',
    'geo.placename': 'Montreal',
    'geo.position': '45.5419;-73.6526',
    'ICBM': '45.5419, -73.6526',
  },
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MusicRecordingStudio',
      '@id': 'https://allianceproductions.ca/#studio',
      name: 'Alliance Productions',
      description: 'Professional recording studio in Montreal offering music production, custom beats, vocal tracking, mixing & mastering, and live instrument sessions.',
      url: 'https://allianceproductions.ca',
      telephone: '+1-514-397-9912',
      email: 'contact@allianceproductions.ca',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '111 Rue Chabanel O',
        addressLocality: 'Montreal',
        addressRegion: 'QC',
        postalCode: 'H2N 1C8',
        addressCountry: 'CA',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 45.5419,
        longitude: -73.6526,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '11:00',
          closes: '22:00',
        },
      ],
      priceRange: '$$',
      image: 'https://allianceproductions.ca/logo.png',
      sameAs: [
        'https://instagram.com/alliancewav',
        'https://facebook.com/alliancewav',
        'https://youtube.com/@alliancewav',
        'https://x.com/Alliancewav',
        'https://tiktok.com/@alliancewav',
      ],
      foundingDate: '2020',
      founder: {
        '@type': 'Organization',
        name: 'Alliance Productions Records Inc.',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://allianceproductions.ca/#business',
      name: 'Alliance Productions',
      description: 'Women-owned professional recording studio and music production label in Montreal.',
      url: 'https://allianceproductions.ca',
      telephone: '+1-514-397-9912',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '111 Rue Chabanel O',
        addressLocality: 'Montreal',
        addressRegion: 'QC',
        postalCode: 'H2N 1C8',
        addressCountry: 'CA',
      },
      areaServed: {
        '@type': 'City',
        name: 'Montreal',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://allianceproductions.ca/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What services does Alliance Productions offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer professional recording sessions, mixing, mastering, beat production, vocal tracking, and live instrument sessions. All services include engineer assistance.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are your studio hours?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We are open Monday through Saturday, 11:00 AM to 10:00 PM. After-hours sessions are available for an additional fee.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where is Alliance Productions located?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '111 Rue Chabanel O, Montréal, QC H2N 1C8. Accessible by metro, street parking available.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I book a session?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can book directly through our website using the booking form, or call us at (514) 397-9912. Bookings require at least 2 days advance notice.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-D6ZPVZVSVF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D6ZPVZVSVF', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="bg-ap-black text-white font-body antialiased">
        <BookingProvider>
          <Navbar />
          {children}
          <GlobalBookingModal />
        </BookingProvider>
        <CookieConsent />
        
        {/* OpenWidget Chat */}
        <Script id="openwidget-config" strategy="lazyOnload">
          {`
            window.__ow = window.__ow || {};
            window.__ow.organizationId = "b3302ecd-2723-4154-95ee-1468ed9f1e4a";
            window.__ow.integration_name = "manual_settings";
            window.__ow.product_name = "openwidget";   
            window.__ow.template_id = "aa12849e-7d36-4638-bd9b-2c26083b6a07";
            ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[OpenWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.openwidget.com/openwidget.js",t.head.appendChild(n)}};!n.__ow.asyncInit&&e.init(),n.OpenWidget=n.OpenWidget||e}(window,document,[].slice))
          `}
        </Script>
        <noscript>
          You need to <a href="https://www.openwidget.com/enable-javascript" rel="noopener nofollow">enable JavaScript</a> to use the communication tool powered by <a href="https://www.openwidget.com/" rel="noopener nofollow" target="_blank">OpenWidget</a>
        </noscript>
      </body>
    </html>
  )
}

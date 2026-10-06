export const STUDIO = {
  name: "Arialfilmandreals",
  full: "Aerial Film & Reel Studio",
  base: "Sector 23, Gandhinagar, Gujarat 382023",
  phone: "+91 9429368879",
  phoneHref: "tel:+9429368879",
  whatsapp: "https://wa.me/9429368879",
  email: "joysolanki055@gmail.com",
  notify: "joysolanki055@gmail.com",
  instagram: "@Arialfilmandreals",
  lat: "23.2156° N",
  lon: "72.6369° E",
};

/* ------------------------------------------------------------------ *
 * Web3Forms access key — from https://app.web3forms.com               *
 * Paste your own key between the quotes below and redeploy.           *
 * While it still says PASTE… the form falls back to FormSubmit +      *
 * email draft, so enquiries still get through.                        *
 * ------------------------------------------------------------------ */
export const WEB3FORMS_KEY = "PASTE_YOUR_WEB3FORMS_ACCESS_KEY";

/* Dropbox Chooser app key — free from dropbox.com/developers (type: Scoped
 * access, "Chooser" enabled). Only needed for the one-click picker; pasting
 * share links works without it. */
export const DROPBOX_APP_KEY = "PASTE_YOUR_DROPBOX_APP_KEY";

/* ------------------------------------------------------------------ *
 * ADMIN PANEL LOCK                                                    *
 *                                                                     *
 * Best: keep the hash out of the source entirely. Add a GitHub Actions *
 * secret named ADMIN_PASSWORD_SHA256 (and optionally ADMIN_SETUP_KEY)  *
 * in Settings → Secrets and variables → Actions. The deploy workflow   *
 * passes them to the build below, so the value is never written into   *
 * your repository. Generate the hash with:                             *
 *   node -e "console.log(require('crypto').createHash('sha256')        *
 *     .update('YOUR-STRONG-PASSWORD').digest('hex'))"                  *
 *                                                                      *
 * You can also paste the values straight in below if you prefer.       *
 * ------------------------------------------------------------------ */

const ENV: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env ?? {};

/* Auth is handled by MongoDB only — the password is stored in the database
 * and never appears in the code, the repository or GitHub Secrets. */

/* ---- FRONTEND on Vercel · BACKEND on Render ----
 * Give the site your Render URL in either of two ways:
 *   1. paste it below, e.g. "https://arialfilmandreals.onrender.com"
 *   2. or set VITE_API_BASE in Vercel → Settings → Environment Variables
 * Leave both empty when the site and the API share a domain. */
const RENDER_URL = "https://arialfilmandreals.onrender.com";

export const API_BASE = ENV.VITE_API_BASE || RENDER_URL;

/* Only needed for the one-time password setup — it must match the
 * ADMIN_SETUP_KEY set in your Render environment variables. */
export const ADMIN_SETUP_KEY = "0000123456789";

/* Two-step login: a 6-digit code is emailed after the password. Set the
 * GitHub secret VITE_OTP_ENABLED to "false" to switch it off. */
export const OTP_ENABLED = ENV.VITE_OTP_ENABLED !== "false";
export const ADMIN_EMAIL = ENV.VITE_ADMIN_EMAIL ?? STUDIO.email;

export const NAV = [
  { id: "work", label: "Work" },
  { id: "library", label: "Library" },
  { id: "services", label: "Services" },
  { id: "kit", label: "Kit" },
  { id: "rates", label: "Rates" },
  { id: "faq", label: "Rules" },
  { id: "contact", label: "Contact" },
];

export const TICKER = [
  "Gandhinagar Sectors 1–30",
  "Kudasan",
  "Sargasan",
  "Randesan",
  "Adalaj",
  "Infocity",
  "GIFT City",
  "Koba",
  "Vavol",
  "Pethapur",
  "Chiloda",
  "Kalol",
  "Sughad",
  "Zundal",
  "SG Highway",
  "Chandkheda",
];

export const STATS = [
  { k: "Aircraft", v: "135 g" },
  { k: "Capture", v: "4K / 30" },
  { k: "Flight", v: "18 min" },
  { k: "Delivery", v: "48 hrs" },
  { k: "From", v: "₹2,999" },
];

export const SERVICES = [
  {
    n: "01",
    title: "Property & real-estate films",
    body: "Hero approach shots, plot boundaries and rooftop-to-street reveals for villas in Sargasan and Kudasan, bungalows in Sectors 18–23 and new towers on the Koba corridor. Cut with iPhone interiors so one film sells the whole property.",
    meta: "60–120 sec film · 3 reels · 20 stills",
    img: "images/plate-villa.jpg",
  },
  {
    n: "02",
    title: "Wedding, sangeet & haldi films",
    body: "The mandap from 40 metres up, the baraat tracked along the road, the garba circle at night. Aerial opening, handheld middle, graded and delivered before the reception photos arrive.",
    meta: "2–3 min film · 6 reels · teaser in 24 hrs",
    img: "images/plate-garba.jpg",
  },
  {
    n: "03",
    title: "Reels for cafés, salons, gyms & brands",
    body: "Vertical-first content built for the feed — hook inside the first 1.5 seconds, cut to trending audio, burnt-in Gujarati or English subtitles. Shot on the Neo for the aerial hook and iPhone for everything close.",
    meta: "30–45 sec reels · 4 to 8 per month",
    img: "images/phone-rig.jpg",
  },
  {
    n: "04",
    title: "Construction & industrial progress",
    body: "Monthly progress films over GIFT City, Adalaj–Koba and Chiloda sites. Same orbit, same altitude, same time of day, every visit — so the time-lapse actually lines up at the end of the project.",
    meta: "Monthly · fixed flight path · archive included",
    img: "images/plate-construction.jpg",
  },
  {
    n: "05",
    title: "Heritage, festival & city films",
    body: "Adalaj Vav, Sarita Udyan, Akshardham, Mahatva Mandir and the Navratri grounds. Slow reveals over carved stone and river mist, made for tourism boards, schools, trusts and cultural events.",
    meta: "90 sec–3 min · licensed score · 4K master",
    img: "images/plate-riverfront.jpg",
  },
];

export const PLATES = [
  {
    id: "02",
    title: "Adalaj Vav",
    sub: "Stepwell survey · dawn pass",
    img: "images/neo-stepwell.jpg",
    coords: "23.1663° N / 72.5816° E",
    meta: "07:12 IST · ALT 42 M · 4K/30",
    span: "sm:col-span-2 sm:row-span-2",
    ratio: "aspect-[4/5] sm:aspect-auto sm:h-full",
  },
  {
    id: "03",
    title: "Sector 21 villa",
    sub: "Nadir pass · property film",
    img: "images/plate-villa.jpg",
    coords: "23.2241° N / 72.6487° E",
    meta: "18:44 IST · ALT 61 M · 4K/30",
    span: "sm:col-span-2",
    ratio: "aspect-[4/3]",
  },
  {
    id: "04",
    title: "Navratri ground",
    sub: "Night orbit · festival film",
    img: "images/plate-garba.jpg",
    coords: "23.2310° N / 72.6602° E",
    meta: "22:31 IST · ALT 88 M · 1/30 S",
    span: "sm:col-span-2",
    ratio: "aspect-[4/3]",
  },
  {
    id: "05",
    title: "GIFT City corridor",
    sub: "Progress pass · monthly",
    img: "images/plate-construction.jpg",
    coords: "23.1567° N / 72.6843° E",
    meta: "16:20 IST · ALT 118 M · 4K/30",
    span: "sm:col-span-2",
    ratio: "aspect-[4/3]",
  },
  {
    id: "06",
    title: "Sabarmati belt",
    sub: "Mist run · city film",
    img: "images/plate-riverfront.jpg",
    coords: "23.1988° N / 72.6021° E",
    meta: "06:38 IST · ALT 34 M · 4K/30",
    span: "sm:col-span-2",
    ratio: "aspect-[16/10]",
  },
];

export const NEO_SPECS: [string, string][] = [
  ["Take-off weight", "135 g"],
  ["Sensor", "1/2″ CMOS · 12 MP"],
  ["Video", "4K/30 · 1080p/60"],
  ["Stabilisation", "1-axis gimbal + RockSteady"],
  ["Lens", "13 mm eq. · f/2.8 · 117.6°"],
  ["ISO", "100 – 6400"],
  ["Flight time", "18 min per battery"],
  ["Storage", "22 GB internal · ~40 min 4K"],
  ["Wind resistance", "8 m/s · Level 4"],
  ["Indian category", "DGCA Nano · no UIN"],
];

export const PHONE_SPECS: [string, string][] = [
  ["Capture", "4K/60 Dolby Vision"],
  ["Slow motion", "1080p/240 fps"],
  ["Modes", "Cinematic · Action · Log"],
  ["Use", "Interiors, faces, macro, low light"],
];

export const EDIT_SPECS: [string, string][] = [
  ["Edit", "Premiere Pro · CapCut"],
  ["Grade", "Lightroom · custom LUT"],
  ["Exports", "9:16 · 1:1 · 16:9 · 4K master"],
  ["Delivery", "Google Drive · 48 hours"],
];

export const RATES = [
  {
    code: "A",
    name: "Reel Drop",
    price: "2,999",
    note: "Solo creators, small cafés, one-day listings",
    items: [
      "1 location · up to 3 hours on site",
      "1 vertical reel, 30–45 seconds",
      "Aerial + iPhone footage, colour graded",
      "Trending audio + burnt-in subtitles",
      "48-hour delivery · 1 revision round",
    ],
  },
  {
    code: "B",
    name: "Aerial Half-Day",
    price: "6,999",
    note: "Most booked — villas, sangeet, brand shoots",
    items: [
      "4 hours · up to 2 locations in Gandhinagar",
      "Aerial video: 60–90 second hero film + 3 reels",
      "Aerial photography: 25 graded stills (12 MP / 4K)",
      "Drone orbits, passes, reveals + iPhone ground coverage",
      "Licensed track, colour grade, sound design",
      "9:16, 1:1 and 16:9 exports · 2 revisions",
    ],
    featured: true,
  },
  {
    code: "C",
    name: "Full Production",
    price: "9,999",
    note: "Weddings, developers, heritage & tourism films",
    items: [
      "Full day · up to 3 locations · 2-person crew",
      "2–3 minute hero film + 6 reels + 20 stills",
      "Storyboard, shot list and recce in advance",
      "Ground-level gimbal work alongside aerials",
      "4K master + social kit · 2 revisions",
    ],
  },
  {
    code: "D",
    name: "Monthly Retainer",
    price: "8,999",
    note: "Per month · cafés, gyms, salons, realtors",
    items: [
      "8 reels every month, shot in 2 visits",
      "Fixed monthly content calendar",
      "Same-day edits for launches and offers",
      "Priority dates · WhatsApp support",
      "Unused rolls carry over for 30 days",
    ],
  },
];

export const PROCESS = [
  {
    n: "01",
    t: "The call",
    d: "Ten minutes on WhatsApp. What it's for, where it's shot, when you need it live.",
  },
  {
    n: "02",
    t: "Flight plan",
    d: "Recce, shot list, Digital Sky zone check and permissions where the site needs them.",
  },
  {
    n: "03",
    t: "Shoot day",
    d: "Neo in the air, iPhone in hand. Golden-hour passes, then interiors and detail.",
  },
  {
    n: "04",
    t: "Edit & grade",
    d: "Rough cut for your notes, then colour, sound design, subtitles and audio.",
  },
  {
    n: "05",
    t: "Delivery",
    d: "4K master plus every social crop on Google Drive — usually within 48 hours.",
  },
];

export const FAQ = [
  {
    q: "Is flying a drone legal in Gandhinagar?",
    a: "Yes, with limits. The DJI Neo is 135 g, which puts it in the DGCA Nano category under the Drone Rules 2021 — no UIN registration and no Remote Pilot Certificate needed. We still fly within visual line of sight, keep well under the green-zone ceiling, check the Digital Sky airspace map before every flight and stay clear of restricted areas around Sachivalaya, defence land and the airport corridor. If a site needs permission, we file it before the shoot date.",
  },
  {
    q: "What if the weather turns?",
    a: "Gandhinagar's monsoon and high winds are the real constraint — the Neo is rated to 8 m/s. If it's too windy, wet or hazy to fly safely, we reschedule at no cost. Ground filming and interiors can still go ahead on the same day if your date is fixed.",
  },
  {
    q: "Do you shoot on iPhone as well as drone?",
    a: "Always. Aerials open the film, but the close shots — faces, food, hands, textures, interiors — are shot on iPhone in 4K/60 with Cinematic mode for shallow depth. Combining both is what makes a reel feel like a film rather than a flyover.",
  },
  {
    q: "How fast can you turn a reel around?",
    a: "Standard is 48 hours. Rush edits — a launch, a listing going live, an event the same night — can be delivered the same day for an added 30%. The teaser for weddings is usually out within 24 hours.",
  },
];

/* ------------------------------------------------------------------ *
 * SAMPLE LIBRARY                                                      *
 * To add or swap media:                                               *
 *   photos → drop the file in  public/images/  and set `img`          *
 *   videos → drop the file in  public/videos/  and set `video` +      *
 *            a poster frame in `img`                                  *
 * `tags` drive the filter buttons; `ratio` is the tile shape.         *
 * ------------------------------------------------------------------ */

export type LibraryItem = {
  id: string;
  kind: "video" | "photo";
  title: string;
  place: string;
  meta: string;
  img: string;
  video?: string;
  tags: string[];
  ratio: string;
};

export const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "video", label: "Video" },
  { id: "photo", label: "Photography" },
  { id: "reels", label: "Reels" },
  { id: "property", label: "Property" },
  { id: "events", label: "Events" },
  { id: "heritage", label: "Heritage" },
];

export const LIBRARY: LibraryItem[] = [
  {
    id: "L01",
    kind: "video",
    title: "Sector grid reveal",
    place: "Sector 21, Gandhinagar",
    meta: "00:18 · 4K/30 · DJI Neo",
    img: "images/hero-sector-grid.jpg",
    video: "videos/sector-grid-reveal.mp4",
    tags: ["video", "reels"],
    ratio: "aspect-[16/10]",
  },
  {
    id: "L02",
    kind: "photo",
    title: "Villa nadir pass",
    place: "Sargasan",
    meta: "Still · 12 MP · ALT 61 M",
    img: "images/plate-villa.jpg",
    tags: ["photo", "property"],
    ratio: "aspect-[4/3]",
  },
  {
    id: "L03",
    kind: "video",
    title: "Garba night orbit",
    place: "Infocity",
    meta: "00:24 · 4K/30 · night",
    img: "images/plate-garba.jpg",
    video: "videos/garba-night-orbit.mp4",
    tags: ["video", "events"],
    ratio: "aspect-[4/3]",
  },
  {
    id: "L04",
    kind: "photo",
    title: "Adalaj Vav at dawn",
    place: "Adalaj",
    meta: "Still · 12 MP · 07:12 IST",
    img: "images/neo-stepwell.jpg",
    tags: ["photo", "heritage"],
    ratio: "aspect-[4/5]",
  },
  {
    id: "L05",
    kind: "video",
    title: "GIFT City progress pass",
    place: "GIFT City corridor",
    meta: "00:31 · 4K/30 · monthly",
    img: "images/plate-construction.jpg",
    video: "videos/gift-city-pass.mp4",
    tags: ["video", "property"],
    ratio: "aspect-[16/10]",
  },
  {
    id: "L06",
    kind: "photo",
    title: "Sabarmati mist run",
    place: "Riverfront",
    meta: "Still · 12 MP · 06:38 IST",
    img: "images/plate-riverfront.jpg",
    tags: ["photo", "heritage"],
    ratio: "aspect-[16/10]",
  },
  {
    id: "L07",
    kind: "video",
    title: "Gandhinagar garden flyover",
    place: "Sarita Udyan · gardens, Gandhinagar",
    meta: "00:28 · 4K/30 · DJI Neo",
    img: "https://images.pexels.com/photos/26811067/pexels-photo-26811067.jpeg?auto=compress&cs=tinysrgb&w=1600",
    video: "videos/gandhinagar-garden.mp4",
    tags: ["video", "heritage", "reels"],
    ratio: "aspect-[16/10]",
  },
  {
    id: "L08",
    kind: "photo",
    title: "Mandap from above",
    place: "Kudasan",
    meta: "Still · 12 MP · dusk",
    img: "images/lib-mandap.jpg",
    tags: ["photo", "events", "reels"],
    ratio: "aspect-[3/4]",
  },
  {
    id: "L09",
    kind: "video",
    title: "Dandi Mandir drone darshan",
    place: "Dandi Mandir, Gandhinagar",
    meta: "00:26 · 4K/30 · DJI Neo",
    img: "https://images.pexels.com/photos/39017057/pexels-photo-39017057.jpeg?auto=compress&cs=tinysrgb&w=1200",
    video: "videos/dandi-mandir.mp4",
    tags: ["video", "heritage"],
    ratio: "aspect-[3/4]",
  },
  {
    id: "L10",
    kind: "photo",
    title: "Party plot at night",
    place: "Sargasan",
    meta: "Still · 12 MP · 22:10 IST",
    img: "images/lib-night.jpg",
    tags: ["photo", "events"],
    ratio: "aspect-[16/10]",
  },
];

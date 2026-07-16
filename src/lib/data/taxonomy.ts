import { Pillar } from "@/lib/types";

// Real, written hero/description/SEO copy for every pillar and group (14 pages total: 3 pillars
// + 11 groups under Mobile & Tech). Subcategory-level pages are NOT built as separate indexed
// routes — see src/app/shop/[pillar]/[group]/page.tsx for why (thin/duplicate-content risk
// across ~70 near-identical leaf pages). Subcategories instead render as in-page filter chips
// on their group's page, which is real and functional without hurting SEO.

export const taxonomy: Pillar[] = [
  {
    slug: "mobile-tech",
    name: "Mobile & Tech",
    tagline: "The core of what we sell",
    heroDescription:
      "Chargers, cables, power banks, audio, protection, and everything else that keeps your devices running — the largest and longest-running part of A2Z.",
    seoTitle: "Mobile & Tech Accessories | A2Z Mobile & Computer Services",
    seoDescription:
      "Shop chargers, cables, power banks, Bluetooth audio, phone protection, computer accessories, and more — genuine products, fast nationwide delivery across South Africa.",
    visualStyle: "dominant",
    isLive: true,
    groups: [
      {
        slug: "charging",
        name: "Charging",
        icon: "Zap",
        heroDescription: "Wall chargers, fast chargers, and everything that puts power back in your devices.",
        seoTitle: "Chargers — Wall, Fast, GaN & Wireless | A2Z",
        seoDescription: "Wall chargers, fast chargers, GaN chargers, wireless chargers, car chargers and multi-port chargers from trusted brands.",
        subcategories: [
          { slug: "wall-chargers", name: "Wall Chargers" },
          { slug: "fast-chargers", name: "Fast Chargers" },
          { slug: "gan-chargers", name: "GaN Chargers" },
          { slug: "wireless-chargers", name: "Wireless Chargers" },
          { slug: "car-chargers", name: "Car Chargers" },
          { slug: "multi-port-chargers", name: "Multi-Port Chargers" },
        ],
      },
      {
        slug: "charging-cables",
        name: "Charging Cables",
        icon: "Cable",
        heroDescription: "USB-C, Lightning, and every other cable your devices actually need.",
        seoTitle: "Charging Cables — USB-C, Lightning & More | A2Z",
        seoDescription: "USB-C cables, Lightning cables, Micro USB, USB-A, HDMI and DisplayPort cables — durable, braided, fast-charge rated.",
        subcategories: [
          { slug: "usb-c-cables", name: "USB-C Cables" },
          { slug: "lightning-cables", name: "Lightning Cables" },
          { slug: "micro-usb-cables", name: "Micro USB" },
          { slug: "usb-a-cables", name: "USB-A" },
          { slug: "hdmi-cables", name: "HDMI" },
          { slug: "displayport-cables", name: "DisplayPort" },
        ],
      },
      {
        slug: "power",
        name: "Power",
        icon: "BatteryCharging",
        heroDescription: "Power banks for every use case — everyday carry, laptops, and load-shedding backup.",
        seoTitle: "Power Banks & Portable Power | A2Z",
        seoDescription: "Power banks, MagSafe power banks, laptop power banks and emergency power solutions, shipped nationwide across South Africa.",
        subcategories: [
          { slug: "power-banks", name: "Power Banks" },
          { slug: "magsafe-power-banks", name: "MagSafe Power Banks" },
          { slug: "laptop-power-banks", name: "Laptop Power Banks" },
          { slug: "emergency-power", name: "Emergency Power" },
        ],
      },
      {
        slug: "audio",
        name: "Audio",
        icon: "Volume2",
        heroDescription: "Earbuds, headphones, and speakers — genuine stock from JBL, Oraimo, and more.",
        seoTitle: "Bluetooth Speakers, Earbuds & Headphones | A2Z",
        seoDescription: "Bluetooth earbuds, headphones, Bluetooth speakers, neckbands and AUX accessories from trusted audio brands.",
        subcategories: [
          { slug: "bluetooth-earbuds", name: "Bluetooth Earbuds" },
          { slug: "headphones", name: "Headphones" },
          { slug: "bluetooth-speakers", name: "Bluetooth Speakers" },
          { slug: "neckbands", name: "Neckbands" },
          { slug: "aux-accessories", name: "AUX Accessories" },
        ],
      },
      {
        slug: "phone-protection",
        name: "Phone Protection",
        icon: "ShieldCheck",
        heroDescription: "Cases and screen protection built for everyday drops, scratches, and daily wear.",
        seoTitle: "Phone Cases & Screen Protectors | A2Z",
        seoDescription: "Phone cases, MagSafe cases, rugged cases, clear cases, screen protectors and camera lens protectors.",
        subcategories: [
          { slug: "phone-cases", name: "Phone Cases" },
          { slug: "magsafe-cases", name: "MagSafe Cases" },
          { slug: "rugged-cases", name: "Rugged Cases" },
          { slug: "clear-cases", name: "Clear Cases" },
          { slug: "premium-cases", name: "Premium Cases" },
          { slug: "screen-protectors", name: "Screen Protectors" },
          { slug: "camera-lens-protectors", name: "Camera Lens Protectors" },
        ],
      },
      {
        slug: "car-accessories",
        name: "Car Accessories",
        icon: "Car",
        heroDescription: "Mounts, chargers, and hands-free essentials for the road.",
        seoTitle: "Car Phone Mounts & Accessories | A2Z",
        seoDescription: "Phone mounts, car chargers, Bluetooth FM transmitters and magnetic mounts for every car.",
        subcategories: [
          { slug: "phone-mounts", name: "Phone Mounts" },
          { slug: "car-chargers-group", name: "Car Chargers" },
          { slug: "bluetooth-fm-transmitters", name: "Bluetooth FM Transmitters" },
          { slug: "magnetic-mounts", name: "Magnetic Mounts" },
        ],
      },
      {
        slug: "computer-accessories",
        name: "Computer Accessories",
        icon: "Laptop",
        heroDescription: "Everything for the desk — mice, keyboards, hubs, and laptop stands.",
        seoTitle: "Computer & Laptop Accessories | A2Z",
        seoDescription: "Wireless mice, keyboards, USB hubs, docking stations, laptop stands, webcam accessories and cooling pads.",
        subcategories: [
          { slug: "wireless-mouse", name: "Wireless Mouse" },
          { slug: "keyboards", name: "Keyboards" },
          { slug: "usb-hubs", name: "USB Hubs" },
          { slug: "docking-stations", name: "Docking Stations" },
          { slug: "laptop-stands", name: "Laptop Stands" },
          { slug: "webcam-accessories", name: "Webcam Accessories" },
          { slug: "cooling-pads", name: "Cooling Pads" },
        ],
      },
      {
        slug: "networking",
        name: "Networking",
        icon: "Wifi",
        heroDescription: "Routers, mesh Wi-Fi, and everything for a faster, more reliable connection.",
        seoTitle: "Routers, Mesh WiFi & Networking | A2Z",
        seoDescription: "Routers, mesh WiFi systems, WiFi extenders, switches, network cables and USB network adapters.",
        subcategories: [
          { slug: "routers", name: "Routers" },
          { slug: "mesh-wifi", name: "Mesh WiFi" },
          { slug: "wifi-extenders", name: "WiFi Extenders" },
          { slug: "switches", name: "Switches" },
          { slug: "network-cables", name: "Network Cables" },
          { slug: "usb-network-adapters", name: "USB Network Adapters" },
        ],
      },
      {
        slug: "storage",
        name: "Storage",
        icon: "HardDrive",
        heroDescription: "Flash drives, memory cards, and external storage for photos, files, and backups.",
        seoTitle: "Flash Drives, Memory Cards & Storage | A2Z",
        seoDescription: "Flash drives, memory cards, card readers and external storage drives.",
        subcategories: [
          { slug: "flash-drives", name: "Flash Drives" },
          { slug: "memory-cards", name: "Memory Cards" },
          { slug: "card-readers", name: "Card Readers" },
          { slug: "external-storage", name: "External Storage" },
        ],
      },
      {
        slug: "smart-gadgets",
        name: "Smart Gadgets",
        icon: "Sparkles",
        heroDescription: "Smart watches, ring lights, tripods, and the everyday gadgets that make life easier.",
        seoTitle: "Smart Watches, Ring Lights & Gadgets | A2Z",
        seoDescription: "Smart watches, selfie sticks, tripods, ring lights, LED lights, mini fans and emergency bulbs.",
        subcategories: [
          { slug: "smart-watches", name: "Smart Watches" },
          { slug: "selfie-sticks", name: "Selfie Sticks" },
          { slug: "tripods", name: "Tripods" },
          { slug: "ring-lights", name: "Ring Lights" },
          { slug: "led-lights", name: "LED Lights" },
          { slug: "mini-fans", name: "Mini Fans" },
          { slug: "emergency-bulbs", name: "Emergency Bulbs" },
        ],
      },
      {
        // Not in the brief's list — added so the two existing, real, currently-linked categories
        // (lcd-screens, repair-parts) stay reachable under the new taxonomy instead of becoming
        // orphaned. See Sprint 2B commit notes.
        slug: "repairs-screens",
        name: "Repairs & Screens",
        icon: "Wrench",
        heroDescription: "Screen replacements, batteries, and the tools and parts for doing repairs right.",
        seoTitle: "Phone Screen Replacements & Repair Parts | A2Z",
        seoDescription: "OEM-quality screen replacements, batteries, repair tool kits and adhesives — genuine parts for technicians and DIY repairs.",
        subcategories: [
          { slug: "screen-replacements", name: "Screen Replacements" },
          { slug: "replacement-batteries", name: "Batteries" },
          { slug: "repair-tools", name: "Repair Tools" },
          { slug: "adhesives-parts", name: "Adhesives & Parts" },
        ],
      },
    ],
  },
  {
    slug: "vape",
    name: "Vape",
    tagline: "Landing soon",
    heroDescription:
      "Disposable vapes, pod systems, vape kits and accessories from trusted brands — coming soon to A2Z.",
    seoTitle: "Vape — Coming Soon | A2Z Mobile & Computer Services",
    seoDescription: "A2Z's vape range is landing soon. Get notified on WhatsApp the moment it's in stock.",
    visualStyle: "dark-premium",
    isLive: false,
    groups: [
      {
        slug: "vape-essentials",
        name: "Vape Essentials",
        icon: "Wind",
        heroDescription: "The full range, landing soon: disposables, pods, kits, e-liquids, and accessories.",
        seoTitle: "Vape Range — Coming Soon | A2Z",
        seoDescription: "Disposable vapes, pod systems, vape kits, replacement pods and coils, e-liquids, batteries, chargers and accessories — landing soon.",
        subcategories: [
          { slug: "disposable-vapes", name: "Disposable Vapes" },
          { slug: "pod-systems", name: "Pod Systems" },
          { slug: "vape-kits", name: "Vape Kits" },
          { slug: "replacement-pods", name: "Replacement Pods" },
          { slug: "replacement-coils", name: "Replacement Coils" },
          { slug: "e-liquids", name: "E-Liquids" },
          { slug: "vape-batteries", name: "Batteries" },
          { slug: "vape-chargers", name: "Chargers" },
          { slug: "vape-accessories", name: "Accessories" },
        ],
      },
    ],
  },
  {
    slug: "hookah",
    name: "Hookah",
    tagline: "The ultimate hookah experience",
    heroDescription: "Premium hookahs, flavours, charcoal and accessories — everything for the perfect session.",
    seoTitle: "Hookah — Hookahs, Charcoal & Accessories | A2Z",
    seoDescription: "Shop hookahs, bowls, charcoal, flavours, hoses, mouthpieces, cleaning kits and accessories — genuine products, fast nationwide delivery across South Africa.",
    visualStyle: "luxury-premium",
    isLive: true,
    groups: [
      {
        slug: "hookah-essentials",
        name: "Hookah Essentials",
        icon: "Flame",
        heroDescription: "Everything you need for the perfect session, from the base to the last coal.",
        seoTitle: "Hookahs, Bowls, Charcoal & Hoses | A2Z",
        seoDescription: "Hookahs, bowls, charcoal, flavours, hoses, mouthpieces, cleaning kits, tongs and accessories.",
        subcategories: [
          { slug: "hookahs", name: "Hookahs" },
          { slug: "bowls", name: "Bowls" },
          { slug: "charcoal", name: "Charcoal" },
          { slug: "flavours", name: "Flavours" },
          { slug: "hoses", name: "Hoses" },
          { slug: "mouthpieces", name: "Mouthpieces" },
          { slug: "cleaning-kits", name: "Cleaning Kits" },
          { slug: "tongs", name: "Tongs" },
          { slug: "hookah-accessories", name: "Accessories" },
        ],
      },
    ],
  },
];

export function getPillar(slug: string) {
  return taxonomy.find((p) => p.slug === slug);
}

export function getGroup(pillarSlug: string, groupSlug: string) {
  const pillar = getPillar(pillarSlug);
  return pillar?.groups.find((g) => g.slug === groupSlug);
}

import type { BoardroomResult, MarketComment, SavedValidation } from "@/lib/types";

export const MOCK_IDEA = "An AI tool that watches your competitor's pricing pages and Slack communities, then alerts you the moment they announce a price change or new feature — so you're never caught flat-footed in a sales call.";
export const MOCK_TARGET_USER = "B2B SaaS AEs and sales managers at 20-200 person startups who lose deals to competitors they didn't see coming.";

export const MOCK_BOARDROOM: BoardroomResult = {
  convictionScore: 6.3,
  actionItem: "The core risk is that sales reps won't change their workflow to check another tool. You need a Slack-native alert flow that interrupts them in the moment — not a dashboard they have to remember to open. Validate this distribution channel before building the scraper.",
  flags: ["unanimous_optimism"],
  blindSpot: "All four panelists missed a critical legal risk: scraping competitor pricing pages may violate their Terms of Service and potentially the CFAA. This needs a legal opinion before launch, as it could force a complete product pivot.",
  personas: [
    {
      name: "Skeptical VC",
      verdict: "CONDITIONAL",
      score: 6,
      steelman_against: "This is a wedge feature, not a company. Gong, Clari, and every major sales intelligence platform will add this in 6 months once it gets traction. The moat is essentially zero.",
      insight: "The market need is real — competitive intelligence is a massive pain for sales teams. But I've seen five variations of this pitch and the consistent failure mode is distribution: reps don't adopt new tools unless the CRO mandates it.",
      objection: "You're dependent on scraping, which is legally fragile and technically brittle. One cease-and-desist from Salesforce and your core data source disappears overnight.",
      recommendation: "Partner with or sell through a CRM like HubSpot or Pipedrive rather than building a standalone product. That's your distribution and your moat.",
    },
    {
      name: "Target User",
      verdict: "PASS",
      score: 8,
      steelman_against: "I already have a Google Alert set up for my top 5 competitors. It's janky but it works. I'm not sure I'd pay $200/month for a polished version of something I've hacked together for free.",
      insight: "I would pay for this today. I found out our biggest competitor dropped their price by 30% from a prospect who told me mid-demo. That was a terrible moment. Real-time alerts with context would have changed that conversation.",
      objection: "The Slack integration is the thing. If I have to open another tab, I won't use it. If it's in Slack with one-click battlecard generation, I'm sold.",
      recommendation: "Charge per seat, not per company. Sales reps will expense this individually if their manager won't buy it — that's your growth loop.",
    },
    {
      name: "Failed Founder",
      verdict: "FAIL",
      score: 4,
      steelman_against: "I tried building exactly this in 2021. The scraping is the easy part. The brutal reality is that 80% of competitive intelligence that matters never makes it onto public pricing pages.",
      insight: "I built a similar product and shut it down after 14 months. The scraping layer was constantly breaking — every time a competitor did a site redesign, we'd have 3-5 days of broken alerts before we patched it. Customers churned the moment you missed a critical update.",
      objection: "The maintenance burden of keeping scrapers working is a full engineering team problem, not a startup problem. You'll spend more time fixing broken scrapers than building features.",
      recommendation: "Narrow to one specific signal — say, G2 review monitoring for competitive sentiment — and do it perfectly. Don't try to boil the ocean with pricing, features, and community scraping simultaneously.",
    },
    {
      name: "Market Analyst",
      verdict: "CONDITIONAL",
      score: 7,
      steelman_against: "Crayon, Klue, and Kompyte have raised a combined $150M+ doing exactly this for enterprise. The SMB/mid-market segment you're targeting is the graveyard where well-funded startups went to die because SMBs won't pay enterprise prices.",
      insight: "The competitive intelligence software market is $2.4B and growing 15% YoY. The existing players (Crayon, Klue) are all priced at $15K+ ARR minimums, deliberately leaving the SMB market unserved. That's a genuine wedge.",
      objection: "Your go-to-market needs to be product-led. A freemium tier monitoring 3 competitors with Slack integration could drive viral adoption in ways the enterprise players can't replicate.",
      recommendation: "Price at $49/month per workspace and go PLG. The enterprise players can't compete at that price point without cannibalizing themselves.",
    },
  ],
};

export const MOCK_THREAD: MarketComment[] = [
  {
    id: "c1",
    agent: "PowerUser_Dev",
    type: "vocal",
    comment: "This is actually solving a real pain. We lost a $45k deal last quarter because a competitor announced a new integration the morning of our demo and the prospect knew before we did. Would have paid for this yesterday.",
    upvotes: 0,
    turn: 1,
    replies: [],
  },
  {
    id: "c2",
    agent: "Skeptic_42",
    type: "vocal",
    comment: "Isn't this just Crayon for poor people? They've raised $60M doing exactly this. What's your moat when they decide to add a $49/mo tier?",
    upvotes: 0,
    turn: 1,
    replies: [],
  },
  {
    id: "c3",
    agent: "EarlyAdopter_Sarah",
    type: "vocal",
    comment: "The Slack-native angle is the differentiator nobody's talking about. Crayon gives you a portal nobody opens. If this actually interrupts my workflow at the right moment, that changes the entire value prop.",
    upvotes: 0,
    turn: 1,
    replies: [],
  },
  {
    id: "c4",
    agent: "LegalEagle_Mike",
    type: "vocal",
    comment: "Hot take: you're going to get cease-and-desisted within 6 months. Scraping competitor pages is in a legal grey zone at best. LinkedIn sued hiQ for less. Have you talked to a lawyer yet?",
    upvotes: 0,
    turn: 1,
    replies: [],
  },
  {
    id: "c5",
    agent: "FounderMode_Alex",
    type: "vocal",
    comment: "The failed founder risk is real. I know two people who tried this. The scraping maintenance is absolutely brutal — every site redesign breaks your parsers. You need to either build an AI-resilient scraper or get data partnerships from day one.",
    upvotes: 0,
    turn: 1,
    replies: [],
  },
  {
    id: "c6",
    agent: "Skeptic_42",
    type: "vocal",
    comment: "To PowerUser_Dev's point — one use case doesn't make a product. What's your retention look like 6 months in when the novelty wears off and reps stop checking alerts?",
    upvotes: 0,
    turn: 2,
    replies: [],
  },
  {
    id: "c7",
    agent: "PowerUser_Dev",
    type: "vocal",
    comment: "@Skeptic_42 retention is a product problem, not a market problem. The alert fatigue risk is real but that's literally just tunable signal quality. I'd rather have the problem of 'too many alerts' than 'no product-market fit'.",
    upvotes: 0,
    turn: 2,
    replies: [],
  },
  {
    id: "c8",
    agent: "EarlyAdopter_Sarah",
    type: "vocal",
    comment: "Replying to LegalEagle — the legal risk is overblown for public pricing pages. But Slack community scraping is a completely different story. I'd personally scope the MVP to just public web pages and leave community monitoring for v2 after you have funding for a legal opinion.",
    upvotes: 0,
    turn: 2,
    replies: [],
  },
  {
    id: "c9",
    agent: "FounderMode_Alex",
    type: "vocal",
    comment: "The AI-resilient scraper angle is actually the real product here. If you can build a scraper that survives site redesigns — using vision models to find prices instead of brittle CSS selectors — that's a genuine moat nobody in the space has.",
    upvotes: 0,
    turn: 2,
    replies: [],
  },
  {
    id: "c10",
    agent: "LegalEagle_Mike",
    type: "vocal",
    comment: "To Sarah's point — you're right on public pages. But the moment you start scraping authenticated Slack workspaces or gated community content, you're in CFAA territory. The MVP scope matters enormously here from a legal standpoint.",
    upvotes: 0,
    turn: 2,
    replies: [],
  },
];

// In-memory store for mock saved results (dev only)
const mockStore = new Map<string, SavedValidation>();

export function saveMockResult(slug: string, data: SavedValidation) {
  mockStore.set(slug, data);
}

export function getMockResult(slug: string): SavedValidation | undefined {
  return mockStore.get(slug);
}

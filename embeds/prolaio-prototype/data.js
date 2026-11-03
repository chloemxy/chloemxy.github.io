/* ==========================================================================
   SINGLE SOURCE OF TRUTH FOR THIS PAGE.

   Edit this file every Friday after the client call, at the same time the
   project status notes are refreshed. Nothing else on the site needs to
   change. Those notes are authoritative; this is their display layer.

   Sources:
     SOW       GoInvo_Prolaio_Research_Gamification_Design_19Jun26.pdf
               (scope, research question, phases, deliverables)
     Timeline  "Prolaio Participant Engagement Schedule" Google Sheet,
               Simplified Timeline (12 weeks) tab (weeks and due dates).
               The SOW describes 14 weeks; the timeline is operative.

   Anything set to null renders as a visible gap, never as invented content.

   Status vocabulary (three states only):
     not-started | in-progress | delivered      (null = not started)
   A deliverable with an href shows a button in the Status column:
   "View deliverable" once delivered, "View draft" while in progress;
   `cta` sets the label outright. An embed reads "View deliverable".

   Date format, everywhere on this page: dd.MON.yyyy, e.g. 22.SEP.2026
   ========================================================================== */

const PROJECT = {
  client: 'Prolaio',
  vendor: 'GoInvo',
  title:  'Participant Engagement',

  eyebrow: 'Prolaio and GoInvo project',

  lede: 'A 12-week engagement to find what keeps participants engaged, and to design ' +
        'for it across enrollment, the mobile app, e-mail and onboarding.',

  currentWeek: 9,
  totalWeeks:  12,
  startDate:   '2026-08-31',   // Monday of week 1; drives the dates on the week ruler

  scheduleIsDraft: false,

  researchQuestion:
    'What are the most viable gamification and engagement tactics for ' +
    'Prolaio’s digital footprint? And how do we design for meaningful ' +
    'engagement, across utility, emotion, social connection, personalization, ' +
    'and narrative, within enrollment flows, mobile apps, e-mail campaigns, ' +
    'and onboarding?',

  contactEmail: null,     // e.g. 'prolaio-engagement@goinvo.com'

  lastUpdated: '06.OCT.2026',
  updatedBy:   null,
};

/* --- What Prolaio is optimising for. Two mission goals, then the operational
       ones they depend on. The engagement is judged against these, so every
       concept should name the one it serves. Sources: the client's stated
       priorities, the SOW's research question, and prolaio.com's positioning
       as cardiovascular research infrastructure. `assumed: true` marks one we
       inferred from R1 and should confirm. --- */
const GOALS = [
  { n: 1, tier: 'mission', name: 'Faster, smaller, better trials',
    short: 'Useful answers with fewer participants and less time.',
    d: 'Continuous data from everyday life, rather than snapshots taken at visits, should let a trial reach a more useful answer with fewer participants and less time. That is the whole proposition, and every operational goal below exists to serve it.',
    ux: 'Shorten the distance between enrolling and producing a usable signal.' },
  { n: 2, tier: 'mission', name: 'Easier for patients and researchers',
    short: 'Less burden on participants and on research teams.',
    d: 'Taking part should cost a participant very little, and running a study should cost a site and a research team less than it does today. Burden on either side is the thing that limits how many trials can run at all.',
    ux: 'Fewer steps, less to read, and nothing that needs explaining twice.' },
  { n: 3, name: 'Good quality data',
    short: 'Complete, continuous readings with no unnoticed gaps.',
    d: 'Complete, continuous and analysable readings. A week with gaps is worth less than a shorter week without them, and data nobody noticed failing to arrive is worth nothing.',
    ux: 'Confirmation that data arrived, and gap detection that reaches out first.' },
  { n: 4, name: 'Adherence to protocol',
    short: 'Participants doing what the study requires, for as long as it requires.',
    d: 'Participants doing what the study design requires, for the window it requires. What matters is whether the data is sufficient, not whether a person scored well.',
    ux: 'Say whether the window produced enough, never a percentage on the person.' },
  { n: 5, name: 'Longitudinal participation',
    short: 'People staying enrolled for the full cycle and returning for the next.',
    d: 'People staying enrolled across the full cycle and returning for the next. Continuity over time is what separates this from a snapshot, and it is where boredom does its damage.',
    ux: 'Vary the experience over the study, and treat the end of a cycle as a handoff rather than a stop.' },
  { n: 6, name: 'Lower cost to support', assumed: true,
    short: 'Fewer support calls and fewer replacement devices.',
    d: 'Fewer calls to answer and fewer replacements to post. R1 suggests most calls are people asking whether they are doing it right, which is a design problem before it is a staffing one.',
    ux: 'Answer "am I doing this right" on the home screen, before anyone picks up the phone.' },
];

/* --- team, shown in the hero (from the kickoff deck's Introductions slide) --- */
const TEAM = [
  { name: 'Claire Lin',  role: 'Lead + Designer', photo: 'files/team/claire.webp' },
  { name: 'Chloe Ma',    role: 'Designer',                photo: 'files/team/chloe.webp'  },
  { name: 'Juhan Sonin', role: 'Advisor',                 photo: 'files/team/juhan.webp'  }
];

/* --- hero metrics --- */
const STATS = [
  { k: 'Engagement week', v: '9', unit: '/ 12', note: 'OCORO participant testing, testing report due week 10' },
  { k: 'Active phase',    v: '2', note: 'Concepting and Design' },
  { k: 'Deliverables delivered', v: '3', unit: '/ 13', note: 'Research and frameworks' },
];

/* --- 12-week schedule, per the timeline sheet. Kickoff was 27.AUG.2026,
       the week before week 1. --- */
const PHASES = [
  {
    id: 'p1', n: 1, name: 'Discovery and Research',
    weeks: [1, 4], status: 'in-progress',
    objective: 'Understand engagement drivers, user mental models, and the ' +
               'competitive landscape to ground gamification strategy in real ' +
               'user needs.',
    activities: [
      'User interviews with patients, trial participants, and enrollment stakeholders',
      'Persona and JTBD definition',
      'Competitive and best-in-class analysis of gamification in digital health, consumer wellness, and adjacent industries',
      'Journey mapping across enrollment, onboarding, mobile app, and e-mail',
    ],
    deliverables: [1, 2, 3, 4],
  },
  {
    id: 'p2', n: 2, name: 'Concepting and Design',
    weeks: [4, 9], status: 'in-progress',
    objective: 'Generate and iterate on gamification concepts across Prolaio’s ' +
               'digital surfaces, grounded in research findings.',
    activities: [
      'Storyboarding and sketching sessions on gamification mechanics',
      'Iterative UI concept development, v01 through v03',
      'Stakeholder working reviews with product, clinical, and leadership',
      'Prolaio participant testing plan, recruitment, and prototype',
    ],
    deliverables: [5, 6, 7, 8, 9, 10],
  },
  {
    id: 'p3', n: 3, name: 'Validation and Recommendations',
    weeks: [10, 12], status: 'not-started',
    objective: 'Validate gamification concepts with target users and deliver ' +
               'evidence-based direction for implementation.',
    activities: [
      'Testing with OCORO participants',
      'Synthesis of testing findings and highest-impact approaches',
      'Prioritized, evidence-backed recommendations for implementation',
    ],
    deliverables: [11, 12, 13],
  },
];

/* Each item is plain text, or [text, target] to link it: target is a
   deliverable number (jumps to its row on this page), a page such as
   'interviews.html', or a section id on this page such as 'design'. */
const WEEK_BLOCKS = [
  { weeks: [1, 2],   phase: 'p1', items: [
      ['Interview guide and recruitment', 'interviews.html'], 'Current experience audit',
      ['Journey map v1', 2], ['Best-in-class analysis', 3] ] },
  { weeks: [3, 4],   phase: 'p1', items: [
      ['User interviews', 'interviews.html'], ['Journey map v2', 2], ['Persona and JTBD synthesis', 1],
      ['Interview report', 4], ['Concepting begins', 'concepts-v01.html'] ] },
  { weeks: [5, 6],   phase: 'p2', items: [
      ['UI Concepts v01', 7], ['UI Concepts v02', 8], ['Testing plan drafting', 10] ] },
  { weeks: [7, 8],   phase: 'p2', items: [
      ['UI Concepts v03', 9], ['Testing plan final', 10], 'Testing recruitment', 'Prototype build' ] },
  { weeks: [9, 10],  phase: 'p3', items: [
      ['OCORO participant testing', 11], ['Testing report', 11] ] },
  { weeks: [11, 12], phase: 'p3', items: [
      ['Final prototype', 13], ['Executive final report and readout', 12] ] },
];

/* --- deliverables: the ten contracted in the SOW, plus the User Interview
       Report from the timeline sheet (1.7). Due = end of the task's bar on
       the timeline sheet.

       href  opens the work as its own page.
       embed opens it in a modal on this page instead, for something that
             lives in a tool rather than on this site (a Figma deck, say).
             Use the embed.figma.com form of the URL, and the file has to be
             shared "anyone with the link can view" or the frame shows a
             permission error to everyone but the file's editors.

             Embed Kit params worth keeping on a Slides URL:
               hide-ui=1        drops Figma's chrome, including the slide
                                thumbnail rail that otherwise sits over the slide
               page-selector=false, footer=false   the older equivalents
               scaling=contain  fits the whole slide instead of cropping it
               theme=light      the deck is light; do not inherit dark   --- */
const DELIVERABLES = [
  { n: 1,  name: 'Personas and JTBD Definition',               phase: 1, status: 'in-progress', version: null, due: '18.SEP.2026',
    note: 'Four personas from R1, the axes that divide participants, and what drives them',
    href: 'personas.html', cta: 'View deliverable' },
  { n: 2,  name: 'Product Opportunities',                      phase: 1, status: 'in-progress', version: null, due: '18.SEP.2026',
    note: 'Six-stage journey map: pain points and opportunities at each stage',
    href: 'opportunities.html', cta: 'View deliverable' },
  { n: 3,  name: 'Competitive and Best-in-Class Analysis',     phase: 1, status: 'in-progress', version: null, due: '11.SEP.2026',
    note: 'Gamification in digital health, consumer wellness, and adjacent industries',
    embed: 'https://embed.figma.com/slides/2diheq5zychTJ2X9JAMoKk/slides?embed-host=share'
         + '&hide-ui=1&page-selector=false&footer=false&scaling=contain&theme=light',
    embedNote: 'Figma Slides, embedded. Use the Figma link to present full screen',
    embedHref: 'https://www.figma.com/slides/2diheq5zychTJ2X9JAMoKk' },
  { n: 4,  name: 'User Interview Report',                      phase: 1, status: 'delivered', version: null, due: '25.SEP.2026',
    note: 'User Interviews R1, seven sessions', href: 'report.html' },
  { n: 5,  name: 'Patient Participation Engine',               phase: 2, status: 'delivered', version: null, due: '29.SEP.2026',
    note: 'v0.3 deck: the smallest helpful thing for each participant, right now', href: 'engine.html' },
  { n: 6,  name: 'Prolaio Service Components',                 phase: 2, status: 'delivered', version: null, due: '29.SEP.2026',
    note: 'Draft v0.1 of the clinical trial service stack', href: 'service-components.html' },
  { n: 7,  name: 'UI Concepts and Prototypes v01',             phase: 2, status: 'in-progress', version: null, due: '02.OCT.2026',
    note: 'Enrollment flows, mobile app, e-mail, onboarding', href: 'concepts-v01.html', cta: 'View deliverable' },
  { n: 8,  name: 'UI Concepts and Prototypes v02',             phase: 2, status: 'in-progress', version: null, due: '09.OCT.2026',
    note: 'Second round of concepts, a click-through of each phase', href: 'concepts-v02.html', cta: 'View deliverable' },
  { n: 9,  name: 'UI Concepts and Prototypes v03',             phase: 2, status: 'in-progress', version: null, due: '16.OCT.2026',
    note: 'The v02 prototypes joined into one continuous participant workflow', href: 'concepts-v03.html', cta: 'View deliverable' },
  { n: 10, name: 'Prolaio Participant Testing Plan and Prototype v04', phase: 2, status: 'in-progress', version: null, due: '16.OCT.2026',
    note: 'The plan, and the prototype v04 participants will test', href: 'testing-plan-and-prototype.html' },
  { n: 11, name: 'Prolaio Participant Testing Report',          phase: 3, status: null, version: null, due: '06.NOV.2026',
    note: 'Findings from testing with OCORO participants' },
  { n: 12, name: 'Final Synthesis and Recommendations Report', phase: 3, status: null, version: null, due: '20.NOV.2026',
    note: 'Executive final report' },
  { n: 13, name: 'Validated Prototype Package',                phase: 3, status: null, version: null, due: '20.NOV.2026',
    note: 'Final prototype' },
];

/* --- Resources: reference material the team uses, not contracted deliverables.
       Same shape as DELIVERABLES minus the SOW bookkeeping. --- */
const RESOURCES = [
  { name: 'Analytics',
    note: 'The OCORO Heart Study dashboard rebuilt, with the funnel, fulfilment timings and discontinuation insights foregrounded',
    href: 'study-data.html' },
];

/* --- design work. add real links as they exist; set live:true to un-stub a card --- */
const DESIGN_LINKS = [
  { name: 'Journey Map and Personas', unlocks: 'Phase 1 · Weeks 1–3',  live: false, href: null,
    note: 'Participant journey with annotated engagement opportunities, plus personas and JTBD' },
  { name: 'UI Concepts v01–v03',      unlocks: 'Phase 2 · Weeks 5–7',  live: false, href: null,
    note: 'Gamification components, interaction patterns, and motivational loops across touchpoints' },
  { name: 'Interactive Prototype',    unlocks: 'Phase 2 · Weeks 8–9',  live: false, href: null,
    note: 'The prototype concept validation testing is run against' },
  { name: 'Validated Prototype Package', unlocks: 'Phase 3 · Weeks 11–12', live: false, href: null,
    note: 'Final prototype and recommendations for implementation' },
];

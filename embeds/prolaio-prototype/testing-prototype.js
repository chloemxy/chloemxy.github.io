/* Testing prototype (27.OCT.2026): forked from journey-v03.js for the testing plan and prototype page. Edits for testing go here; Concepts v03 stays as it is. */
/* ==========================================================================
   Participant journey (Concepts v03, forked from v02 on 19.OCT.2026; v02 keeps the originals): opportunity callouts and the
   click-through prototype for each area.

   JR_AREAS holds one entry per numbered opportunity area on the journey.
     insight the user need, in one statement
     opp     the opportunity (shown in the prototype modal's notes, not on the card)
     flow    the concepts the prototype steps through, as [UI id, punchy name,
             the participant's moment in the journey (shown under the phase
             timeline), how disruptive it is (1 familiar, 2 new pattern,
             3 disruptive; kept as a record, not shown), and for a detour
             { d: <the step it branches from> }].
   v03 reads the four chapters as one stream (V03-STREAM.md): Next runs on
   across chapters along the main line; a detour sits right after the step it
   branches from, is opened from that step, and comes back to the main line.
   Moved to the page as explainers: the unlock map and the evolving home.
             Ids are keys of UI2 in journey-ui.js (the v02 screens), with UI
             in concepts-ui.js (the v01 mockups, frozen) as the fallback.
   ========================================================================== */

const JR_AREAS = [
  { n: 1, name: 'Setup', when: 'Day 1',
    insight: 'Participants want to know what to expect, how long it takes, and that their setup worked.',
    opp: 'Setup by doing, confirmed step by step.',
    flow: [['welcome', 'Welcome', 'First open', 1],
           ['ac-confirm', 'Confirm Account', 'Is this you?', 1],
           ['ac-code', 'Set a Code', 'Keeping it private', 1],
           ['2A', 'Month Preview', 'Before setup', 2],
           ['1B', 'Setup Overview', 'Starting setup', 1], ['1B-s1', 'Setup Wizard', 'Connecting devices', 2],
           ['cn-band-err', 'Bracelet Won’t Connect', 'The bracelet won’t connect', 1, { d: '1B-s1' }],
           ['ck-1-resume', 'Resume Setup', 'Back after a break', 1, { d: '1B-s1' }],
           ['sc-skip', 'Setup Not Finished', 'The next morning', 1, { d: '1B-s1' }],
           ['ck-1', 'Day-One Checklist', 'Setup done', 2],
           ['sc-free', 'Nothing Due Today', 'A first day with no tasks', 1, { d: 'ck-1' }],
           ['sc-any', 'Any Order', 'Tasks with no set order', 1, { d: 'ck-1' }]] },
  { n: 2, name: 'First week', when: 'Days 2 to 8',
    insight: 'Participants need to see, early and often, that their data is arriving.',
    opp: 'Show every day that the data arrived.',
    flow: [['ck-2-0', 'Patch Week', 'Patch week, morning', 2],
           ['ts-1', 'Fix It Yourself', 'The bracelet stopped syncing', 2, { d: 'ck-2-0' }],
           ['rd-err', 'Reading Error', 'The cuff was too loose', 1, { d: 'ck-2-0' }],
           ['ck-2', 'All Done', 'Today’s tasks done', 1], ['6A', 'Week Strip', 'Checking the week', 2], ['5B', 'Back-to-Back Readings', 'Evening readings', 3],
           ['1D', 'Week-One Recap', 'Week one wrapped', 2]] },
  { n: 3, name: 'Routine', when: 'Weeks 2 to 4',
    insight: 'Routine gets boring; participants need new ways to stay engaged and encouraged.',
    opp: 'Vary what they see, and pay back each task.',
    flow: [['ck-3', 'Daily Checklist', 'Start of week three', 1],
           ['res-hub', 'Resources Hub', 'Browsing resources', 2],
           ['v2-3-community', 'Community', 'Patch feels itchy', 3, { d: 'res-hub' }],
           ['v2-3-streak', 'Streaks', 'Seventeen days running', 2], ['v2-3-poll', 'Daily Trivia', 'A quick morning check', 3],
           ['v2-3-tally', 'Contribution Tally', 'Curious about progress', 2], ['v2-3-dash', 'Health Dashboard', 'Looking at trends', 2],
           ['16A', 'Earnings Tracker', 'Payment coming up', 2]] },
  { n: 4, name: 'Check-ins and wrap-up', when: 'Days 30 to 90',
    insight: 'Participants want their own data back, in terms they understand and can choose to share.',
    opp: 'Give data back from week one, and return the results at the end.',
    flow: [['ck-4-0', 'Report Lock', 'Check-in morning', 3],
           ['ck-4', 'Report Unlocked', 'Final reading in', 3],
           ['14A', 'Month over Month', 'First monthly report', 2],
           ['12A', 'Data Receipt', 'After the check-in', 2],
           ['9D', 'Report Countdown', 'Waiting for the next report', 2],
           ['rn', 'Study Updates', 'Before the next cycle', 2],
           ['rc-1', 'Re-consent', 'The consent changed', 2, { d: 'rn' }], ['15D', 'Report Cards', 'The last day', 2],
           ['v2-4-impact', 'Impact', 'End of cycle one', 2],
           ['v2-4-region', 'Your Region', 'When the study ends', 1, { d: 'v2-4-impact' }],
           ['yr', 'Keep the Phone', 'A year in the study', 1, { d: 'v2-4-impact' }]] },
];

/* --------------------------------------------------------------------------
   JR_COMPARE: a step that shows several screens side by side instead of
   one phone, each with its label and what changed. Keyed by the flow id.
   -------------------------------------------------------------------------- */
const JR_COMPARE = {
  'home-evolve': [
    ['1A', '', 'Day 1', 'The roadmap: where you are, what’s next.'],
    ['ck-2-0', '', 'Day 6', 'Today’s tasks, then the patch.'],
    ['ck-3-0', '', 'Day 15', 'Week three: a short list, your progress above it.'],
    ['ck-4-0', '', 'Day 30', 'The report leads.'],
  ],
  /* alternate scenarios at the readings: each names the one fix, keeps
     Try again first, and reaches the study team */
  'rd-errs': [
    ['rd-err-conn', 'Lost connection', 'Error 10', 'Phone next to the cuff, or plug the cuff in.'],
    ['rd-err-move', 'Moved while measuring', 'Errors 0 to 2', 'Rest your arm, stay still, try again.'],
    ['rd-err-unk', 'Something went wrong', 'Errors 5 to 9', 'Wait 5 minutes; twice, and it points to the team.'],
    ['rd-err-sc', 'Weight didn’t arrive', 'Scale', 'Step off, wait, step on again.'],
  ],
  'al-errs': [
    ['al-batt', 'Battery low', 'Amber banner', 'Can wait until tonight.'],
    ['al-lost', 'Data may be lost', 'Amber banner', 'Keep the phone close for a minute.'],
    ['al-worn', 'Not worn', 'Red banner, then a sheet', 'Data is being missed, so it says how to wear it.'],
    ['al-team', 'The study team', 'From every error', 'Call Dana or send a message; anything medical goes to your doctor.'],
  ],
};

/* --------------------------------------------------------------------------
   JR_MAPS: a step that is a diagram, not a phone (15.OCT.2026). The unlock
   map: week one is only the tasks, learned properly; the rest opens when it
   has something to show. Rows: [flow id or '', name, the week it opens
   (0 = week 1 ... 4 = week 5), what opens it (shown on hover)].
   -------------------------------------------------------------------------- */
const JR_MAPS = {
  'unlock-map': {
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    groups: [
      /* v04 (28.OCT.2026): the days match the app (UNLOCKS and the
         Resources rows in testing-prototype-ui.js) */
      ['Learn the routine', [
        ['ck-3', 'Daily checklist', 0, 'Day 1'],
        ['', 'Readings and questionnaires', 0, 'Day 1, one at a time'],
        ['', 'Help and the study team', 0, 'Day 1, from every screen'],
        ['v2-4-share-study', 'Referral', 0, 'Day 1, from the menu, Resources and Settings'],
        ['v2-3-poll', 'Daily trivia', 0, 'Day 3, once the first readings are in', 3],
        ['v2-3-streak', 'Streaks', 0, 'Day 3, after three days in a row', 3],
        ['v2-3-community', 'Community', 0, 'Day 1, from the start', 1],
        ['v2-3-tally', 'Contribution tally', 0, 'Day 7, a week of data to stack', 7],
      ]],
      ['Once the routine is set', [
        ['res-hub', 'Resources hub', 1, 'Day 8, after week one', 8],
        ['v2-3-dash', 'Health dashboard', 1, 'Day 8, a week of readings to compare', 8],
        ['16A', 'Earnings tracker', 1, 'Day 8, with the first payment', 8],
        ['1D', 'First-week summary', 1, 'Day 8, how each part went', 8],
      ]],
      ['At the month’s end', [
        ['', 'Monthly report', 4, 'Day 30, from your own readings', 30],
        ['v2-4-impact', 'Impact', 4, 'Day 90, what your 90 days added up to', 90],
      ]],
    ],
  },
};

/* --------------------------------------------------------------------------
   JR_POINTS: the main feature and the idea behind each concept, as short
   bullets on the right above the R1 evidence and the insight
   (15.OCT.2026). Chapters 3 and 4; keyed by phase, then flow id. Each
   list runs in the order you meet things: top of the screen down, then
   what a tap opens.
   -------------------------------------------------------------------------- */
const JR_POINTS = {
  3: {
    'unlock-map': ['A timeline that opens features week by week', 'The community is open from day 1; week one adds trivia on day 3', 'Extras unlock once they have data to show'],
    'ck-3': ['Your streak, days of data and earnings, each opening its page', 'A progress bar that tracks tasks done today', 'A checklist of today’s tasks under it', 'Health tiles below, each with its change since day 1'],
    'res-hub': ['One page that links to everything', 'Rows grouped by topic, each with an icon', 'A back link from every screen it opens'],
    'v2-3-streak': ['A day counter that tracks days in a row', 'A week strip of days done and still to come', 'A progress bar toward the next $2 bonus'],
    'v2-3-poll': ['A one-tap quiz card on the home screen', 'A coach mark that points it out once', 'Bars that show how everyone answered'],
    'v2-3-community': ['A list of questions from other participants', 'A reply count, and a tag when the study team answers', 'Moderated, so it stays calm'],
    'v2-3-tally': ['A Jenga tower that adds a layer for each day of data', 'A missing block for a missed day, never a fall', 'Count tiles for everything sent so far'],
    'v2-3-dash': ['A grid of tiles, one per vital', 'A small trend line on each tile', 'An arrow for the change since day 1, no verdict'],
    'v2-3-badges': ['A coach mark that points them out once', 'A grid of badges, each worth a cash bonus', 'Locked badges show what earns them'],
    '16A': ['A big number for what you’ve earned so far', 'Every payment and when it comes', 'Milestone bonuses, each one cash, not a sticker', 'Staying a year keeps the study phone'],
  },
  4: {
    'home-evolve': ['Four home screens side by side, Day 1 to Day 30', 'Starts as a roadmap, ends with the report at the top', 'The top of the screen changes with each phase'],
    '12A': ['A check mark and a receipt after each task', 'What was collected, in one line', 'How it’s used, in one line'],
    '11A': ['Your latest readings, newest first', 'A trend line under the main number', 'Tap a row for its full history'],
    'ck-4-0': ['A locked report card at the top of the home screen', 'A blurred preview of what’s inside', 'One button to take the reading that unlocks it'],
    'ck-4': ['The report card, unlocked, at the top', 'One button to open it', 'Today’s one task left, below'],
    '14A': ['A list of changes since last month', 'An up or down arrow and amount for each', 'No good or bad labels'],
    'v2-4-region': ['A dropdown to look at another city', 'A dot map of people taking part near you', 'Tiles that put your numbers next to the area’s', 'Bars that show who takes part, by age'],
    '19B': ['Short update cards from the study team', 'One finding per card, newest first', 'A line on how many people it came from'],
    'rn': ['What’s changing, away from the daily tasks', 'A consent, if there is one, gets its own answer'],
    '15D': ['Swipeable cards instead of a long document', 'One number per card, in plain words', 'Dots that show how many cards are left'],
    'v2-4-impact': ['Count tiles for what your 90 days added up to', 'Results for the whole study, shared only when it ends, with who took part near you', 'An example from a finished study, so you know what is coming'],
    'v2-4-share-study': ['A link to the study page, with a Copy button'],
  },
};

/* what each bullet points at on the phone, in the same order as the
   bullets: a selector for the feature, or null where it only shows after a
   tap. A dotted line joins the feature to its bullet */
const JR_POINT_TARGETS = {
  'ck-3': ['.j-hs', '.j-ckh', '.j-cks', '.j-dbs'],
  'res-hub': ['.j-ress', '.j-res > i', null],
  'v2-3-streak': ['.j-spot .u-card', null, null],
  'v2-3-poll': ['.j-spot .u-card', '.j-spot__tip', null],
  'v2-3-community': ['.j-ths', '.j-th em', null],
  'v2-3-tally': ['.j-jg', '.j-jg__l i.is-gap', '.j-tls'],
  'v2-3-dash': ['.j-dbs', '.j-db .u-spark', '.j-db i'],
  'v2-3-badges': ['.j-spot', null, null],
  '16A': ['.u-num', '.u-rows', '.j-bgs', '.j-yr'],
  '12A': ['.u-earn__b', '.u-card--edge', '.u-card:not(.u-card--edge)'],
  '11A': ['.u-card--edge .u-num', '.u-card--edge .u-spark', '.u-rows'],
  'ck-4-0': ['.j-r30', '.j-r30__doc', '.j-r30__btn'],
  'ck-4': ['.j-r30', '.j-r30__btn', null],
  '14A': ['.u-dls', '.u-dls > *', null],
  'v2-4-region': ['.j-city', '.u-map', '.j-tls', '.j-pls'],
  '19B': ['.u-card--edge', '.u-card--edge .u-lead', '.u-card--edge .u-note:last-child'],
  'rn': ['.j-crs', '.j-cr[data-tap="view:rc-1"]'],
  '15D': ['.u-card--edge', '.u-num', '.u-dots'],
  'v2-4-impact': ['.j-sts', '.j-imp__lock', '.j-imp__card'],
  'v2-4-share-study': ['.j-link2'],
  '5B': ['.j-rd__art', '.j-rd__b', '.u-thumb .u-btn:not(.u-btn--ghost)'],
  'rd-bp': ['.j-rd__art', '.j-rd__fact', null],
  'rd-bp-done': ['.j-rd__art', '.j-yd', '.u-thumb .u-btn'],
  'rd-sc': ['.j-rd__art', '.j-rd__b', '.u-thumb .u-btn:not(.u-btn--ghost)'],
  'rd-sc-done': ['.j-rd__art', '.j-yd', '.u-thumb .u-btn'],
  /* only the line on what it unlocks is lit */
  'rd30': [null, '.j-rd__b', null],
  'rd30-m': ['.j-rd__art', '.j-rd__b', null],
  'rd30-done': [null, '.j-rd__b', '.u-thumb .u-btn'],
};

/* the deeper screens a chapter 3 or 4 concept leads into, with their own
   bullets, so what the list says always matches the screen */
const JR_SCREEN_POINTS = {
  /* the evening readings, reached from a checklist or a spotlight */
  '5B': ['A picture of where the cuff goes', 'One line on how to sit', 'One Start button'],
  'rd-bp': ['A ring that moves while the cuff measures', 'A fun fact while you wait', 'Moves on by itself when done'],
  'rd-bp-done': ['Your reading, large in the ring', 'How it changed since yesterday', 'One button on to your weight'],
  'rd-sc': ['A scale with footprints to stand on', 'Your weight appears as you step on', 'One button when you’re on'],
  'rd-sc-done': ['Your weight, large on the scale', 'How it changed since yesterday', 'Done takes you home'],
  /* the day 30 final reading, from the locked report */
  'rd30': ['A picture of where the cuff goes', 'A line on what this reading unlocks', 'One Start button'],
  'rd30-m': ['A monitor that shows the cuff measuring', 'A note that 30 days go into your report', 'Moves on by itself when done'],
  'rd30-done': ['Your final reading, large on the monitor', 'Report unlocked, said in one line', 'One button to see the report'],
};

/* --------------------------------------------------------------------------
   JR_SCENES: the scene for each screen in a card's flow, shown under the
   insight in the prototype modal. Written to read aloud to OCORO
   participants in a session: when it is, what just happened, why they open
   the app. Keyed by card number, then by UI id from that card's flow; a
   screen with no entry shows no scene.
   -------------------------------------------------------------------------- */
const JR_SCENES = {
  1: {
    'welcome': ['Day 1, Saturday, 9:58 AM', 'Your kit arrived. The study phone opens straight into the app.'],
    'ac-confirm': ['Day 1, 9:58 AM', 'Before anything else, the app checks it has the right person.'],
    'ac-code': ['Day 1, 9:59 AM', 'A 4-digit code keeps the app’s health data private.'],
    '2A':  ['Day 1, 10:00 AM', 'Before setup, a preview of what the month asks of you.'],
    '1A':  ['Day 1, 10:05 AM', 'A roadmap: your kit is here, device setup is next.'],
    '1B':  ['Day 1, 10:06 AM', 'All six setup steps up front, with how long each takes.'],
    '1B-s1': ['Day 1, 10:07 AM', 'One step at a time, moving on once each device connects, then notifications: read aloud or not, and a sleep window.'],
    'cn-band-err': ['Day 1, 10:12 AM', 'The bracelet won’t connect: three fixes, then the study team.'],
    'ck-1-0': ['Day 1, 10:08 AM', 'Setup becomes today’s checklist, first task at the top.'],
    'ck-1': ['Day 1, 10:30 AM', 'Setup done: connected devices are ticked, with what each sent.'],
    '8A':  ['Day 1, 10:30 AM', 'The scale won’t connect. The screen shows you getting closer.'],
    'ck-1-resume': ['Day 1, 12:30 PM', 'You stopped for lunch. Setup picks up where you left off.'],
    'sc-skip': ['Day 2, morning', 'What if setup isn’t finished: Today keeps it at the top.'],
    'sc-free': ['Day 1, 10:30 AM', 'What if nothing is due on day one: Today says what’s next.'],
    'sc-any': ['Day 1, 11:00 AM', 'What if tasks have no set order: start any one now.'],
  },
  2: {
    '7A':  ['Day 2, Sunday morning', 'Day 2: you check yesterday’s readings and sleep came through.'],
    'ts-1': ['Day 6, 7:40 AM', 'What if the bracelet stops syncing: three quick fixes to try.'],
    'byod-4': ['Day 6, 7:40 AM', 'What if your phone closes the app: one setting stops it.'],
    'ck-2-0': ['Day 6, Thursday, 7:30 AM', 'Patch week. What’s left today first; what’s done below.'],
    '4D':  ['Day 6, Thursday, 8:05 AM', 'Four quick questions, one tap each.'],
    'bp-lock': ['Day 6, 8:00 PM', 'An evening reminder opens the app straight at the cuff.'],
    'ck-2': ['Day 6, 8:05 PM', 'Blood pressure in, today’s list is complete.'],
    '6A':  ['Day 7, Friday morning', 'The week so far: what came through, and what’s next.'],
    '5B':  ['Day 7, Friday, 7:30 PM', 'Evening readings back to back: blood pressure, then weight.'],
    'rd-err': ['Day 7, 7:32 PM, if it goes wrong', 'The cuff was too loose: one fix, then try again.'],
    'rd-errs': ['Any evening, if it goes wrong', 'Other ways a reading fails, each with the one thing to do.'],
    'al-errs': ['Any day, if the bracelet needs you', 'Bracelet alerts: amber can wait, red means data is missed.'],
    'tm-lock': ['Day 7, 10:15 AM, if data stops', 'Two days without bracelet data: Dana messages, you tap a reply.'],
    '1D':  ['Day 7, Friday, 9:00 PM', 'Week one done: how each part went, and one tip for next week.'],
  },
  3: {
    'unlock-map': ['Weeks 1 to 5, the plan', 'Week one is the core tasks and the community; trivia opens day 3.'],
    'ck-3': ['Day 15, Monday morning', 'Week three: a shorter list first, your health below.'],
    'v2-3-streak': ['Day 17', 'Your streak on the home screen: 17 days, 4 more to a bonus.'],
    'v2-3-poll': ['Day 18, morning', 'A one-tap heart trivia question, then how everyone answered.'],
    'v2-3-community': ['Day 18, evening', 'Your patch itches: you ask other participants, the team watches.'],
    'res-hub': ['Day 16, morning', 'Resources: everything you look back on, on one page.'],
    'byod-5': ['Day 16, morning', 'What if you get a new phone: sign in, and devices reconnect.'],
    'v2-3-tally': ['Day 19', 'Everything you’ve sent the study, added up.'],
    'v2-3-dash': ['Day 19, a minute later', 'Your vitals side by side, last three weeks.'],
    'v2-3-badges': ['Day 21', 'A three-week streak earns a badge; each adds a small bonus.'],
    '16A': ['Week 5', 'What you’ve earned so far, and what’s next.'],
  },
  4: {
    'home-evolve': ['Day 1 to Day 30', 'The same home screen, four mornings apart, to day 30.'],
    '12A': ['Day 30, after the check-in', 'Check-in done: what was collected, and how it’s used.'],
    '11A': ['Day 18, later', 'Your latest readings, newest first.'],
    'ck-4-0': ['Day 30, 7:00 AM', 'Check-in day. The report is locked until one final reading.'],
    'ck-4': ['Day 30, later that morning', 'Final reading in, the report unlocks.'],
    '14A': ['Day 31', 'What changed since last month.'],
    '9D':  ['Day 54', 'The month’s last week: how far you are from your next report.'],
    'rc-1': ['Day 80, evening', 'What if the consent changes: the change is marked, you choose.'],
    'v2-4-region': ['When the study ends', 'What if the study is done: from Impact, who took part near you, beside your own numbers.'],
    'rn': ['Day 80, evening', 'Cycle 2 starts on its own. The app says what’s changing, apart from the daily tasks.'],
    '19B': ['Day 75', 'What the research team is learning, including from your data.'],
    'v2-4-impact': ['Day 90, that evening', 'What your 90 days added up to; study results come at the end.'],
    'yr': ['Day 365', 'What if you stay a year: the study phone becomes yours.'],
    'v2-4-share-study': ['Day 90, later', 'On the way out, a simple way to pass the study on.'],
    '15D': ['Day 90', 'Your last day. Your summary as a few short cards.'],
  },
};

/* --------------------------------------------------------------------------
   JR_NOTES: R1 evidence pinned to the screen it supports, shown as callouts
   beside the phone in the prototype modal. Keyed like JR_SCENES. Each note
   is a stat { s, t } (`s` as report.js states the count) or a quote
   { q, who }, verbatim from interviews.js; a note-based line is credited
   "paraphrased". Screens with nothing that fits well have no entry.
   -------------------------------------------------------------------------- */
const JR_NOTES = {
  1: {
    '2A': [{ s: '1', t: 'outright dropout in R1 traced to not grasping what a procedure would feel like.' },
           { q: 'They did tell me the procedure, I just didn’t know what it [meant]… I just didn’t think it would be that painful.', who: 'Erhan' }],
    '1B-s1': [{ q: 'I get pretty lost when I have, like, issues… it’s nice when someone… reaches out to me, and they’re like, hey, want to try this?', who: 'Morgan' }],
    'cn-band-err': [{ q: 'I get pretty lost when I have, like, issues… it’s nice when someone… reaches out to me, and they’re like, hey, want to try this?', who: 'Morgan' }],
  },
  2: {
    '7A': [{ q: 'Then I sit down and say, okay, I don’t have to worry about it… it makes me feel more reassured.', who: 'Bonnie' }],
    '4D': [{ q: 'I prefer one at a time. It’s less overwhelming.', who: 'Jazmine' }],
    'bp-lock': [{ q: 'I felt pretty, like, isolated… I didn’t know if I was doing something wrong or right.', who: 'Morgan' }],
    '6A': [{ s: '6 of 7', t: 'favored the on-track week view.' },
           { q: 'Wants daily status he can act on: anything “yellow or red” to fix today. Check-ins that “keep me honest”; weekly is “too late.”', who: 'Jeff, paraphrased' }],
    'ck-2': [{ q: 'I do like the progress. I don’t like leaving unchecked boxes.', who: 'Nissa' }],
    '5B': [{ s: '5 of 7', t: 'disengaged from repetitive tasks or manual logging.' },
            { q: 'Make sure it’s interesting all the way throughout, and… the same things aren’t just being repeated.', who: 'Jazmine' },
          { q: 'It’ll… show me 3 hours later… how that meal affected my blood sugars… it makes me want to log stuff like that more often.', who: 'Nissa' }],
    'tm-lock': [{ s: '6 of 7', t: 'reported an operational failure in a past study, like sync failures nobody noticed.' },
           { q: 'I didn’t know that there was a problem. They contacted me.', who: 'Bonnie' }],
    '1D': [{ s: '6 of 7', t: 'reported an operational failure in a past study, like sync failures nobody noticed.' }],
  },
  3: {
    'v2-3-streak': [{ q: 'When you’re having to do something every day… I’m a teacher, I’m gonna get an F, you know?', who: 'Jessica' }],
    'v2-3-community': [{ q: 'It would be cool to have… a forum or something, where people can maybe talk about their symptoms.', who: 'Jazmine' }],
    'v2-3-badges': [{ q: 'Here’s a sticker. What am I gonna do with a sticker?', who: 'Jeff' }],
    'v2-3-tally': [{ q: 'Tracking your own progress, whether it be you’ve completed day 14 of 28… more so than earning a badge or anything. I don’t care about that.', who: 'Jessica' }],
    'v2-3-dash': [{ s: '7 of 7', t: 'favored a dashboard with drill-down into their own data.' }],
    '16A': [{ s: '7 of 7', t: 'chose or accepted tiered milestone cash over a charity pool.' },
            { q: 'Reminding me of the compensation… this is how much you’ve earned so far, here’s how much you will have total, that is definitely a motivator for me.', who: 'Jazmine' }],
  },
  4: {
    '12A': [{ q: 'Knowing that what I’m doing will be beneficial is the biggest motivator.', who: 'Jazmine' }],
    '11A': [{ q: 'I wish I had some of the stats, because I would use that data with AI now.', who: 'Jeff' }],
    '14A': [{ q: 'If I hadn’t taken the time to go back and pull those previous reports, I don’t know that the plan would have been the same.', who: 'Jessica' }],
    '19B': [{ q: 'Why would I be doing this if not to understand its value? And you get that through outcomes and impact statements.', who: 'Jeff' }],
    'v2-4-region': [{ s: '4 of 7', t: 'drawn to “you vs. the group”; Jeff calls it shaming.' },
                    { q: 'Knowing if I’m, like, dead last in performance would be good to know.', who: 'Morgan' },
                    { q: 'I’m not in the study to compete with other people.', who: 'Bonnie' }],
    'v2-4-share-study': [{ q: 'Definitely part of the motivation was… the compensation… as well as wanting to know my own blood pressure readings… and… helping other people.', who: 'Bonnie' }],
    'v2-4-impact': [{ s: '7 of 7', t: 'picked a specific framing over the generic “future research” one.' }],
    '15D': [{ s: '4 of 7', t: 'asked for reference ranges, flags or interpretation.' },
            { q: 'It can be hard to understand what to do with that information, or… figure out what the numbers mean.', who: 'Morgan' }],
  },
};

(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* a stat tile: the count large, and for "n of 7" a row of seven dots
     with n filled, so the share reads at a glance */
  function statTile(p) {
    var m = /^(\d+) of (\d+)$/.exec(p.s), dots = '';
    if (m) {
      for (var i = 0; i < +m[2]; i++) dots += '<i' + (i < +m[1] ? ' class="on"' : '') + '></i>';
      dots = '<span class="jr-co__dots" aria-hidden="true">' + dots + '</span>';
    }
    return '<div class="jr-co__stat"><div class="jr-co__num"><b>' + esc(m ? m[1] : p.s) + '</b>' +
      (m ? '<small>of ' + m[2] + '</small>' : '') + dots + '</div>' +
      '<p>' + esc(p.t) + '</p></div>';
  }

  /* v03: no stage cards under the journey; each stage's name, days and
     insight are in the prototype's left panel, and the brackets' dots jump
     the prototype to that stage */

  /* each stage's bracket under the journey, its dot in the middle */
  function wires() {
    var svg = $('jr-wires');
    if (!svg) return;
    var box = svg.parentNode.getBoundingClientRect(), grid = document.querySelector('.jr');
    if (!grid || !grid.offsetParent) { svg.innerHTML = ''; return; }
    svg.innerHTML = JR_AREAS.map(function (a) {
      var m = document.querySelector('.jr-mark[data-area="' + a.n + '"]');
      if (!m) return '';
      var mr = m.getBoundingClientRect();
      var l = mr.left - box.left + 1, r = mr.right - box.left - 1, t = mr.top - box.top, y = mr.bottom - box.top;
      var hotNow = m.classList.contains('is-hot') || m.classList.contains('is-now') ? ' class="is-hot"' : '';
      return '<path data-area="' + a.n + '"' + hotNow + ' d="M' + l + ' ' + t + 'V' + y + 'H' + r + 'V' + t + '"/>';
    }).join('');
  }
  wires();
  if (window.ResizeObserver) new ResizeObserver(wires).observe($('jr-wires').parentNode);
  window.addEventListener('resize', wires);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(wires);

  /* v03: the journey map starts short, just the stages and their days with
     the day line, as the docked copy shows it. A click on it opens the full
     rows (steps, tools, the stage brackets); another click closes it. The
     brackets' dots and the day line keep their own clicks */
  (function () {
    var link = document.querySelector('.jr-link'), grid = document.querySelector('.jr');
    if (!link || !grid) return;
    grid.setAttribute('tabindex', '0');
    /* the columns keep the widths of the full map when it is short (some
       size to their rows' content, which is hidden then), so every stage
       and day sits in the same place open or closed */
    var cols = grid.style.gridTemplateColumns;
    function lockCols() {
      grid.style.gridTemplateColumns = cols;
      if (!link.classList.contains('is-short')) return;
      link.classList.remove('is-short');
      var w = getComputedStyle(grid).gridTemplateColumns;
      link.classList.add('is-short');
      grid.style.gridTemplateColumns = w;
    }
    window.addEventListener('resize', function () {
      if (!link.classList.contains('is-short')) return;
      lockCols(); wires();
      if (typeof window.jrRelayout === 'function') window.jrRelayout();
    });
    /* a click on the short map opens it, as does its button; open, a click
       on a stage or a day goes to that day (see "a click on the timeline",
       below) and a click anywhere else closes it */
    var head = document.querySelector('.jr-head'), more = document.createElement('button');
    more.type = 'button'; more.className = 'jr-more';
    if (head) head.appendChild(more);
    more.addEventListener('click', function () { toggle(); });
    function set(short) {
      link.classList.toggle('is-short', short);
      lockCols();
      grid.setAttribute('aria-expanded', String(!short));
      more.textContent = short ? 'Show full map' : 'Hide full map';
      more.setAttribute('aria-expanded', String(!short));
      wires(); alignDots();
      if (typeof window.jrRelayout === 'function') window.jrRelayout();
    }
    var toggle = function () { set(!link.classList.contains('is-short')); };
    /* 22.OCT.2026: a click on the timeline never opens or closes the map;
       it goes to that day (toDay, below). The map opens from its button */
    grid.addEventListener('keydown', function (e) {
      if (e.target === grid && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(); }
    });
    setTimeout(function () { set(true); });
  })();

  /* the dotted lanes are laid from the bar's right edge, a dot per 16px (daily) or 32px.
     Widen each label to the next 32px tile boundary, which falls between dots in both
     lanes, so no dot is ever cut where the dots meet the label */
  function alignDots() {
    document.querySelectorAll('.jr .jr-bar--readings span, .jr .jr-bar--quest span').forEach(function (s) {
      s.style.paddingRight = s.style.background = '';
      var right = s.parentNode.getBoundingClientRect().right;
      var gap = (right - s.getBoundingClientRect().right) % 32;
      s.style.paddingRight = (6 + gap) + 'px';            // 6px is the label's own padding
      // the added width takes the track's colour, so the white label looks unchanged
      s.style.background = 'linear-gradient(90deg, var(--white) calc(100% - ' + gap + 'px), var(--purple-bg) 0)';
    });
  }
  alignDots();
  if (window.ResizeObserver) document.querySelectorAll('.jr .jr-bar--readings, .jr .jr-bar--quest')
    .forEach(function (b) { new ResizeObserver(alignDots).observe(b); });
  window.addEventListener('resize', alignDots);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignDots);

  /* a callout, its bracket and its line light up together */
  var hot = function (n, on) {
    document.querySelectorAll('[data-area="' + n + '"]').forEach(function (el) {
      el.classList.toggle('is-hot', on);   /* classList works on the svg paths too */
    });
  };
  document.querySelectorAll('.jr-mark').forEach(function (el) {
    var n = el.getAttribute('data-area');
    el.addEventListener('mouseenter', function () { hot(n, true); });
    el.addEventListener('mouseleave', function () { hot(n, false); });
  });

  /* ---------------------------------------------------------- prototype */
  var dlg = $('pt'), area = null, i = 0;

  /* ------------------------------------------------------------- stream.
     Every step of every chapter in order; MAIN is the main line (detours
     left out), which Next, the skip buttons and the journey bar follow */
  var STREAM = [];
  JR_AREAS.forEach(function (a) {
    a.flow.forEach(function (f, k) { STREAM.push({ a: a, k: k, id: f[0], f: f, d: (f[4] && f[4].d) || null }); });
  });
  var MAIN = STREAM.filter(function (s) { return !s.d; });
  var stepAt = function (a, k) { return STREAM.find(function (s) { return s.a === a && s.k === k; }); };
  var here = function () { return stepAt(area, i); };
  var byId = function (id) {
    return STREAM.find(function (s) { return s.id === id && s.a === area; }) || STREAM.find(function (s) { return s.id === id; });
  };
  /* the main-line step this one is, or branches from */
  var mainOf = function (st) { return st && st.d ? byId(st.d) : st; };
  var mainIdx = function () { return MAIN.indexOf(mainOf(here())); };
  var detoursOf = function (st) { return STREAM.filter(function (s) { return s.d === st.id && s.a === st.a; }); };
  /* the main step Next goes on to: after a detour, the one after the step it left */
  var nextMain = function () { return MAIN[mainIdx() + 1] || null; };
  /* home: the newest home moment at or before this point of the stream (a
     checklist, or a home with the streak, the trivia or the report bar on it) */
  var isHome = function (id) { return /^ck-/.test(id) || ['v2-3-streak', 'v2-3-poll', '9D'].indexOf(id) >= 0; };
  function homeId() {
    for (var q = STREAM.indexOf(mainOf(here())); q >= 0; q--) if (!STREAM[q].d && isHome(STREAM[q].id)) return STREAM[q].id;
    /* before the first home (during setup): the first home, never the welcome */
    var first = STREAM.find(function (s) { return !s.d && isHome(s.id); });
    return first ? first.id : area.flow[0][0];
  }
  /* the study day of this moment, from its scene ("Day 6, Thursday" -> 6;
     "Week 5" -> 29), else the part's usual day */
  /* v03: the day line slid to another day shows that day (homes and
     Resources follow it); a move of the stream puts it back */
  var scrub = null;
  /* the line reaches through the renewals to two years (journey-ui-v03.js MAX_DAY) */
  var LAST_DAY = window.MAX_DAY || 90;
  function shownDay() { return scrub && scrub.at === here() ? scrub.day : dayNow(); }
  /* the home for the day on show: the day line's day if it was slid */
  function homeNow() { return scrub && scrub.at === here() && window.homeAt ? window.homeAt(scrub.day) : homeId(); }
  function dayNow() {
    var mo = mainOf(here()), sc = (JR_SCENES[area.n] || {})[mo.id], t = sc ? sc[0] : '';
    var d = /Day (\d+)/.exec(t), w = /Week (\d+)/.exec(t);
    return d ? +d[1] : w ? +w[1] * 7 - 6 : ({ 1: 1, 2: 6, 3: 16, 4: 48 })[area.n];
  }
  /* smart animate (v03, like Figma's): what both screens share stays and
     glides from where it was to where it is now, and doesn't come in again;
     only what's new rises in. Shared means the same kind of element with
     the same words, numbers aside ("10 day streak" is "12 day streak").
     snap() before the screen changes, play() after; play() returns how much
     of the new screen was already there. A redraw mid-move snaps the
     current, moving positions, so it carries on. Used by both phones */
  window.ptSmart = (function () {
    /* the bottom button is pinned, not risen in (30.OCT.2026): mid-rise it
       sat 10px low, over the home bar */
    var UNIT = '.u-body > :not(.j-hd):not(.u-thumb), .j-hd .u-nav, .j-cks > *, .j-ress > *, .j-hs > *, .j-dbs > *, .j-today > *, .j-tabs';
    /* what makes two elements the same one, as a layer name does in Figma:
       a list or strip is whatever it holds (its rows match one by one); a
       row, tile or figure is its name (Patch, Avg sleep, day streak),
       whatever its time, value or state says that day; a coach mark is
       what it lights; a variant (--soon, --q) is still the same one.
       Anything else is its kind and its words, numbers and plurals aside */
    var BOX = '.j-cks, .j-today, .j-hs, .j-dbs, .j-ress, .j-tabs, .j-sub';
    var NAMED = [['.j-tvc', '.u-k'], ['.j-new', 'b'], ['.j-ck', 'b'], ['.j-db', 'em'], ['.j-hs__i', 'em'], ['.j-today > *', 'em'], ['.j-res', 'b']];
    var words = function (t) {
      return t.replace(/[\d$,.:%]+/g, '#').replace(/# (\w+?)s\b/g, '# $1').replace(/\s+/g, ' ').trim().slice(0, 60);
    };
    var keyOf = function (el) {
      if (el.classList.contains('j-spot') && el.firstElementChild) return keyOf(el.firstElementChild);
      var kind = el.tagName + '.' + String(el.className).replace(/\b(is-[\w-]+|j-same|[\w-]+--[\w-]+)\b/g, '').replace(/\s+/g, ' ').trim();
      if (el.matches(BOX)) return kind;
      for (var q = 0; q < NAMED.length; q++) if (el.matches(NAMED[q][0])) {
        var nm = el.querySelector(NAMED[q][1]);
        if (nm) return kind + '|' + words(nm.textContent);
      }
      return kind + '|' + words(el.textContent);
    };
    function snap(root) {
      var m = {};
      if (root) root.querySelectorAll(UNIT).forEach(function (el) {
        if (!el.getClientRects().length) return;
        var k = keyOf(el);
        (m[k] = m[k] || []).push(el.getBoundingClientRect());
      });
      return m;
    }
    /* allow: on a redraw mid-move, only what was shared at the start counts
       as shared, so the new parts keep rising instead of jumping in */
    function play(root, before, dur, allow) {
      var scr = root && root.querySelector('.u-scr');
      if (!scr || !scr.getClientRects().length) return { ratio: 0, keys: {} };
      /* the phone is zoomed: page pixels back to the screen's own */
      var s = scr.getBoundingClientRect().width / (scr.offsetWidth || 1) || 1;
      var used = {}, keys = {}, n = 0, hit = 0;
      root.querySelectorAll(UNIT).forEach(function (el) {
        if (!el.getClientRects().length) return;
        n++;
        var k = keyOf(el), list = before[k], at = used[k] || 0;
        if (!list || at >= list.length || (allow && !allow[k])) return;
        used[k] = at + 1; hit++; keys[k] = 1;
        el.classList.add('j-same');
        var a = list[at], b = el.getBoundingClientRect();
        var dx = (a.left - b.left) / s, dy = (a.top - b.top) / s;
        el._d = [dx, dy];
        /* inside something that is already gliding, only its own share */
        var up = el.parentElement && el.parentElement.closest('.j-same');
        while (up && !up._d) up = up.parentElement && up.parentElement.closest('.j-same');
        if (up) { dx -= up._d[0]; dy -= up._d[1]; }
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.animate([{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'none' }],
          { duration: dur || 380, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      });
      return { ratio: n ? hit / n : 0, keys: keys };
    }
    /* the same screen on another day (a scrub along the timeline): nothing
       moves. Only what reads differently fades up where it stands, so a
       glide through the days reads as the numbers changing, not the screen
       rebuilding. texts() before the redraw, tick() after it */
    function texts(root) {
      var m = {};
      if (root) root.querySelectorAll(UNIT).forEach(function (el) {
        if (el.matches(BOX)) return;
        var k = keyOf(el);
        (m[k] = m[k] || []).push(el.textContent.replace(/\s+/g, ' ').trim());
      });
      return m;
    }
    function tick(root, before) {
      var hit = [];
      root.querySelectorAll(UNIT).forEach(function (el) {
        /* no layout check: the real phone may be hidden while its twin shows */
        if (el.matches(BOX)) return;
        var t = el.textContent.replace(/\s+/g, ' ').trim(), was = before[keyOf(el)];
        if (was && was.indexOf(t) >= 0) return;
        if (el.parentElement && el.parentElement.closest('.j-tick')) return;
        el.classList.add('j-tick'); hit.push(el);
      });
      /* off again once it has played, so a later copy (the twin) doesn't replay it */
      setTimeout(function () { hit.forEach(function (el) { el.classList.remove('j-tick'); }); }, 320);
    }
    return { snap: snap, play: play, texts: texts, tick: tick };
  })();
  var SMART = window.ptSmart.SMART = 0.35;   /* this much already there: no slide, only the new parts rise */

  /* motion (v03): every change is smart animate. What stays glides, and
     each kind of new element comes in the same way whichever way you move
     (journey-v03.css). The direction (fwd, back, fade) is still recorded on
     the screen for reference; each new screen gets a stamp so the Prolaio
     twin plays it once (theme-demo-v03.js) */
  var navDir = null, inStamp = 0;
  function enter(dir) {
    var sc = $('pt-phone').querySelector('.u-scr');
    if (!sc) return;
    sc.setAttribute('data-enter', dir);
    sc.setAttribute('data-in', String(++inStamp));
  }
  function setArea(a) { if (a !== area) { area = a; $('pt-opp').textContent = area.insight; } }
  function jump(st) {
    if (!st) return;
    navDir = navDir || 'fade';
    trail = []; hist = [];
    setArea(st.a);
    i = st.k; show();
  }

  /* ------------------------------------------------ in-phone interactions.
     Hotspots carry data-tap (see journey-ui.js for the actions). */
  var screenOf = function (id) {
    return (typeof UI2 !== 'undefined' && UI2[id]) ||
      ((typeof UI !== 'undefined' && UI[id]) ? UI[id] : '');
  };
  /* a screen with data-auto="<action>;<ms>" runs that action by itself,
     as a splash screen moves on once loading is done */
  var autoT = null, autoAct = null;
  /* one timer at a time; Skip runs what it is waiting for straight away */
  function schedule(action, ms) {
    clearTimeout(autoT);
    autoAct = action;
    autoT = setTimeout(function () { autoAct = null; skipState(); tap(action); }, ms);
    skipState();
  }
  function unschedule() { clearTimeout(autoT); autoAct = null; skipState(); }
  function skipState() { if ($('pt-skip')) $('pt-skip').disabled = !autoAct && !$('pt-phone').querySelector('[data-step]'); }
  /* skip: run the waiting action now, and carry on through any that only
     change this screen in place (the connect dots), so one tap reaches the end */
  function skip() {
    for (var j = 0; j < 12 && !autoAct && $('pt-phone').querySelector('[data-step]'); j++) tap('step');
    for (var k = 0; k < 12 && autoAct; k++) {
      var act = autoAct;
      unschedule();
      tap(act);
      if (!/^(morph|swap|unlock):/.test(act)) break;
    }
  }
  /* where you have been inside this concept, for Previous: the step and the
     screen. Cleared when the concept opens or the arrows or dots move it */
  var trail = [], cur = null;
  /* what Previous steps back through: the phone as it was before each tap
     or Next, so it returns to the last screen you could act on, sheets and
     in-place stages included. A screen that runs on by itself (a wait) is
     passed over, or Previous would land on it and be carried forward again */
  var hist = [];
  function snap() {
    var ph = $('pt-phone'), b = ph.querySelector('.u-body');
    return { a: area, i: i, id: cur, html: ph.innerHTML, top: b ? b.scrollTop : 0, wait: !!autoAct, trail: trail.slice() };
  }
  function remember() {
    var s = snap(), t = hist[hist.length - 1];
    if (t && t.a === s.a && t.i === s.i && t.id === s.id && t.html === s.html) return;
    hist.push(s);
    if (hist.length > 60) hist.shift();
  }
  var passing = function (s) { return s.wait; };
  function restore() {
    var now = snap(), s;
    while (hist.length) {
      s = hist.pop();
      if (s.a === now.a && s.i === now.i && s.id === now.id && s.html === now.html) continue;
      if (passing(s) && hist.length) continue;
      if (s.a !== area || s.i !== i) { setArea(s.a); i = s.i; show(); }
      if (cur !== s.id) render(s.id);
      trail = s.trail;
      unschedule();
      if (!dlg.classList.contains('is-compare')) {
        var before = ptSmart.snap($('pt-phone'));
        $('pt-phone').innerHTML = s.html;
        enter('back');
        if (ptSmart.play($('pt-phone'), before).ratio >= SMART) $('pt-phone').querySelector('.u-scr').setAttribute('data-enter', 'smart');
        var b = $('pt-phone').querySelector('.u-body');
        if (b) b.scrollTop = s.top;
      }
      skipState();
      return true;
    }
    return false;
  }
  function cmpFig(c) {
    return '<figure class="pt__cmp-i"><div class="pt__cmp-ph"><div class="cn-ph pt__phone">' + screenOf(c[0]) + '</div></div>' +
      '<figcaption>' + (c[1] ? '<b>' + esc(c[1]) + '</b>' : '') + '<em>' + esc(c[2]) + '</em><span>' + esc(c[3]) + '</span></figcaption></figure>';
  }
  /* the unlock map: a row per feature, a bar from the week it opens */
  function mapHTML(m) {
    var n = m.weeks.length;
    var head = '<div class="pt__um-r pt__um-r--h"><span></span>' + m.weeks.map(function (w) { return '<em>' + esc(w) + '</em>'; }).join('') + '</div>';
    var body = m.groups.map(function (g) {
      return '<p class="pt__um-g">' + esc(g[0]) + '</p>' + g[1].map(function (r) {
        /* the bar is unlabelled; what opens it shows on hover */
        return '<div class="pt__um-r" data-w="' + r[2] + '"><span class="pt__um-f"><b>' + esc(r[1]) + '</b></span>' +
          '<span class="pt__um-bar" title="' + esc(r[3]) + '" style="grid-column:' + (r[2] + 2) + ' / ' + (n + 2) + '"><s></s></span></div>';
      }).join('');
    }).join('');
    return '<div class="pt__um">' + head + body + '</div>';
  }
  /* the bullets follow the screen showing, not just the concept: the
     concept's own bullets on its screen, a deeper screen's own (a reading,
     a full streak) where it has them, and none where it hasn't */
  function points(id) {
    if (!$('pt-points') || !area) return;
    var base = id.replace(/^res\./, '');
    var pts = (JR_POINTS[area.n] || {})[base] || (area.n >= 3 && JR_SCREEN_POINTS[base]) || [];
    var tg = JR_POINT_TARGETS[base] || [];
    /* chapters 3 and 4 show their points as highlights on the screen
       (spotPoints, below), as chapters 1 and 2 do, not as a list */
    $('pt-points').innerHTML = '';
    $('pt-points').hidden = true;
    linksSoon();
  }
  /* each point lit on the screen, its words beside the phone on a leader
     line (spotLabel), the rest of the screen dimmed. The feature itself
     becomes the spot, so the layout doesn't move; a point with nothing on
     this screen to light (it shows after a tap) is left out, and so is a
     feature the screen already spotlights itself */
  function spotPoints(id) {
    if (!area || area.n < 3) return;
    var base = id.replace(/^res\./, '');
    var pts = (JR_POINTS[area.n] || {})[base] || JR_SCREEN_POINTS[base] || [];
    var tg = JR_POINT_TARGETS[base] || [];
    var ph = $('pt-phone'), scr = ph.querySelector('.u-scr'), lit = false;
    pts.forEach(function (p, k) {
      var el = tg[k] && ph.querySelector(tg[k]);
      if (!el || el.closest('.j-spot:not(.j-spot--pt)') || el.querySelector('.j-spot:not(.j-spot--pt)')) return;
      /* the spot rules are written for a wrapper around a feature; here the
         feature is the spot, so it keeps its own layout */
      var c = getComputedStyle(el), keep = {};
      ['margin', 'display', 'flexDirection', 'gap', 'alignItems', 'justifyContent', 'alignSelf', 'justifySelf'].forEach(function (k) { keep[k] = c[k]; });
      var pos = c.position;
      var bare = c.backgroundColor === 'rgba(0, 0, 0, 0)' && c.backgroundImage === 'none';
      el.classList.add('j-spot', 'j-spot--pt');
      if (bare) el.classList.add('j-spot--box');
      Object.keys(keep).forEach(function (k) { el.style[k] = keep[k]; });
      if (pos !== 'static') el.style.position = pos;
      el.insertAdjacentHTML('beforeend', '<p class="j-spot__tip">' + esc(p) + '</p>');
      lit = true;
    });
    if (lit && scr) scr.classList.add('is-spotlit');
  }
  /* dotted lines from each feature on the phone to its bullet: drawn over
     the modal, from the phone showing (the theme phone when the before one
     is hidden), and only for features in view */
  var linkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  linkSvg.setAttribute('class', 'pt__links'); linkSvg.setAttribute('aria-hidden', 'true');
  dlg.appendChild(linkSvg);
  var linksQueued = false;
  function linksSoon() { if (!linksQueued) { linksQueued = true; setTimeout(links, 30); } }
  function links() {
    linksQueued = false;
    var out = '', list = $('pt-points');
    if (dlg.open && list && !list.hidden && list.offsetParent && !dlg.classList.contains('is-compare')) {
      var twin = dlg.querySelector('.td-twin .td-ph');
      var ph = twin && twin.offsetParent ? twin : $('pt-phone');
      var body = ph.querySelector('.u-body'), view = (body || ph).getBoundingClientRect();
      var lis = [].slice.call(list.querySelectorAll('li'));
      lis.forEach(function (li) { li.style.marginTop = ''; });
      /* the feature's height on the screen for each bullet, where it can be
         seen inside the phone's screen */
      var ys = lis.map(function (li) {
        var sel = li.getAttribute('data-sel'), el = sel && ph.querySelector(sel);
        if (!el || !el.getClientRects().length) return null;
        var r = el.getBoundingClientRect();
        var y = Math.max(r.top + 6, Math.min(r.top + r.height / 2, r.bottom - 6));
        if (r.bottom < view.top + 4 || r.top > view.bottom - 4 || y < view.top || y > view.bottom) return null;
        return { y: y, x1: Math.min(r.right, view.right) - 6 };
      });
      /* beside the phone, each bullet spaced down to sit level with its
         feature, so its line runs straight across; one that can't move up
         that far keeps its place and its line bends to reach it */
      var beside = list.getBoundingClientRect().left > view.right;
      lis.forEach(function (li, i) {
        var f = ys[i]; if (!f) return;
        var l = li.getBoundingClientRect(), a = Math.min(l.height / 2, 10);
        var y2 = l.top + a;
        if (beside && f.y > y2 + .5) { li.style.marginTop = (f.y - y2) + 'px'; y2 = f.y; }
        var x2 = l.left - 22, k = +li.getAttribute('data-k') || 0;
        var d = Math.abs(y2 - f.y) < 1 ? 'M' + f.x1 + ' ' + f.y + 'H' + x2
          /* square corners where it bends: each upright a few pixels apart,
             so they never run on top of each other */
          : (function (xm) { return 'M' + f.x1 + ' ' + f.y + 'H' + xm + 'V' + y2 + 'H' + x2; })(Math.min(x2 - 10, Math.max(f.x1 + 10, view.right + 14 + k * 7)));
        out += '<g data-k="' + k + '"><path d="' + d + '"/><circle cx="' + f.x1 + '" cy="' + f.y + '" r="3"/></g>';
      });
    } else if (list) {
      list.querySelectorAll('li').forEach(function (li) { li.style.marginTop = ''; });
    }
    linkSvg.innerHTML = out;
  }
  window.addEventListener('resize', linksSoon);
  dlg.addEventListener('scroll', linksSoon, true);
  dlg.addEventListener('close', function () { linkSvg.innerHTML = ''; });
  new MutationObserver(linksSoon).observe(dlg.querySelector('.pt__stage'), { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  /* a bullet in hover lights its line */
  dlg.addEventListener('mouseover', function (e) {
    var li = e.target.closest && e.target.closest('#pt-points li[data-k]');
    linkSvg.querySelectorAll('g').forEach(function (g) { g.classList.toggle('is-hot', !!li && g.getAttribute('data-k') === li.getAttribute('data-k')); });
  });
  var inPlace = false;   /* set by scrubTo: the same screen, another day */
  var homeTop = {};
  function render(id) {
    unschedule();
    var was = cur, dir = navDir, calm = inPlace;
    inPlace = false;
    navDir = null;
    cur = id;
    points(id);
    /* a compare step: the screens side by side, small, instead of the phone;
       a map step: a diagram in the same place */
    var map = typeof JR_MAPS !== 'undefined' && JR_MAPS[id];
    var cmp = (typeof JR_COMPARE !== 'undefined' && JR_COMPARE[id]) || map;
    dlg.classList.toggle('is-compare', !!cmp);
    dlg.classList.toggle('is-map', !!map);
    var box = $('pt-cmp');
    if (cmp && !box) {
      box = document.createElement('div');
      box.id = 'pt-cmp'; box.className = 'pt__cmp';
      $('pt-phone').after(box);
    }
    if (box) box.innerHTML = map ? mapHTML(map) : cmp ? cmp.map(cmpFig).join('') : '';
    var tabSw = !cmp && /^tab/.test(dir || '');
    var before = !cmp && !calm && !tabSw && (id !== was || dir) ? ptSmart.snap($('pt-phone')) : null;
    var ob = calm && $('pt-phone').querySelector('.u-body'), top = ob ? ob.scrollTop : 0;
    /* Today keeps where it was scrolled to: back on it, it opens there (30.OCT.2026) */
    var lb = $('pt-phone').querySelector('.u-body');
    if (lb && was && was !== id && $('pt-phone').querySelector('.j-cks')) homeTop[was] = lb.scrollTop;
    var said = calm && !cmp ? ptSmart.texts($('pt-phone')) : null;
    sheetStack = []; sheetKey = null;
    $('pt-phone').innerHTML = cmp ? '' : screenOf(id);
    pinSheetTops($('pt-phone'));
    if (tabSw) enter(dir);
    if (said) {
      var nb = $('pt-phone').querySelector('.u-body');
      if (nb) nb.scrollTop = top;
      ptSmart.tick($('pt-phone'), said);
    }
    if (before) {
      enter(dir || 'fwd');
      if (ptSmart.play($('pt-phone'), before).ratio >= SMART) $('pt-phone').querySelector('.u-scr').setAttribute('data-enter', 'smart');
    }
    if (!said && homeTop[id] && $('pt-phone').querySelector('.j-cks')) { var hb = $('pt-phone').querySelector('.u-body'); if (hb) hb.scrollTop = homeTop[id]; }
    if (!cmp) spotPoints(id);
    if (typeof showWhere === 'function') showWhere();
    toEnd();
    setTimeout(gate, 80);
    skipState();
    var a = $('pt-phone').querySelector('[data-auto]');
    if (a) {
      var v = a.getAttribute('data-auto').split(';');
      schedule(v[0], +v[1] || 1500);
    }
    publishFeedbackScreen();
  }
  function publishFeedbackScreen() {
    dlg.dataset.feedbackScreen = ['v03', area.n, area.flow[i][0], shownDay(), cur].join(':');
    dlg.dataset.feedbackScreenLabel = area.name + ' · Day ' + shownDay() + ' · ' + area.flow[i][1];
    document.dispatchEvent(new CustomEvent('pr-feedback-screen-change'));
    keep();
  }
  /* a refresh comes back where it was: the screen, its day and how far down
     the page, kept for this tab only */
  var KEEP = 'pt-at:' + location.pathname;
  function keep() {
    try { sessionStorage.setItem(KEEP, JSON.stringify({ s: dlg.dataset.feedbackScreen, y: Math.round(window.scrollY) })); } catch (e) {}
  }
  /* while the page is still scrolling back to it, the spot isn't overwritten */
  var keepT = 0, restoring = false;
  window.addEventListener('scroll', function () { if (!restoring) { clearTimeout(keepT); keepT = setTimeout(keep, 200); } }, { passive: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  /* a thread (data-morph="end") keeps its newest message in view, as a
     chat does: on opening, and after each reply */
  function toEnd() {
    var mt = $('pt-phone').querySelector('[data-morph="end"]');
    var b = mt && mt.closest('.u-body');
    if (b) b.scrollTop = b.scrollHeight;
  }
  /* a button with data-gate="end" stays off until the screen has been
     scrolled to the end, so the whole screen is seen before going on */
  function gate() {
    var g = $('pt-phone').querySelector('[data-gate="end"].is-gated');
    if (!g) return;
    /* any phone showing this screen counts (the Prolaio copy beside it, or
       on its own with Before hidden), but only once it is laid out: a
       hidden screen measures as already at the end */
    var done = [].some.call(dlg.querySelectorAll('.pt__phone .u-body'), function (body) {
      return body.clientHeight && body.scrollTop + body.clientHeight >= body.scrollHeight - 4;
    });
    if (done) g.classList.remove('is-gated');
  }
  /* an overlay can run on by itself too (data-auto inside it) */
  function autoIn(ov) {
    var a = ov && ov.querySelector('[data-auto]');
    if (!a) return;
    var v = a.getAttribute('data-auto').split(';');
    schedule(v[0], +v[1] || 1500);
  }
  /* v03: a sheet's top stays put while the sheet scrolls: the grab bar,
     the ✕, and the label and title it opens with go in one sticky block.
     Done on the screen itself, so the Prolaio twin copies it as it is */
  function pinSheetTops(root) {
    if (!root) return;
    root.querySelectorAll('.j-sh').forEach(function (sh) {
      if (sh.querySelector(':scope > .j-sh__top')) return;
      var top = document.createElement('div');
      top.className = 'j-sh__top';
      [].slice.call(sh.querySelectorAll(':scope > .j-sh__h, :scope > .j-sh__x')).forEach(function (el) { top.appendChild(el); });
      var first = sh.firstElementChild;
      if (first && first.classList.contains('j-sh__k')) { top.appendChild(first); first = sh.firstElementChild; }
      if (first && first.classList.contains('u-lead')) {
        /* a title that only repeats the label above it is dropped */
        var k = top.querySelector('.j-sh__k');
        if (k && k.textContent.trim().toLowerCase() === first.textContent.trim().toLowerCase()) first.remove();
        /* under a label, a big title is one header too many: what it says
           (a time, how often) stays as a small line under the label */
        else if (k && first.classList.contains('u-lead--big')) { first.className = 'j-sh__sub'; top.appendChild(first); }
        else top.appendChild(first);
      }
      sh.insertBefore(top, sh.firstChild);
    });
    /* a sheet reached from another sheet (or another page of it) has a ‹
       at its top left, back to where it came from */
    var top = sheetStack.length && root.querySelector('.j-ov:not(.is-out) .j-sh__top');
    if (top && !top.querySelector('.j-sh__b')) {
      top.classList.add('has-back');
      top.insertAdjacentHTML('afterbegin', '<span class="j-sh__b" data-tap="sheetback" role="button" aria-label="Back">‹</span>');
    }
  }
  /* the sheets passed through on the way to this one: { key, page } */
  var sheetStack = [], sheetKey = null;
  /* change the open panel's content in place, without sliding it again */
  function swapOverlay(key) {
    var html = typeof UI2X !== 'undefined' && UI2X[key];
    if (html) sheetKey = key;
    var ov = $('pt-phone').querySelector('.j-ov');
    if (!html || !ov) { openOverlay(key); return; }
    var t = document.createElement('div');
    t.innerHTML = html;
    var sh = t.querySelector('.j-sh'), old = ov.querySelector('.j-sh');
    if (!sh || !old) return;
    sh.style.animation = 'none';
    old.replaceWith(sh);
    pinSheetTops(ov);
    autoIn(ov);
  }
  function closeOverlay(then) {
    unschedule();
    var ov = $('pt-phone').querySelector('.j-ov');
    if (!ov) { if (then) then(); return; }
    ov.classList.add('is-out');
    setTimeout(function () { ov.remove(); if (then) then(); }, 180);
  }
  function openOverlay(key) {
    /* notifications: what the app has said up to this moment's day */
    if (key === 'notifs3' && typeof notifSheet === 'function') UI2X.notifs3 = notifSheet(shownDay());
    var html = typeof UI2X !== 'undefined' && UI2X[key];
    var scr = $('pt-phone').querySelector('.u-scr');
    if (!html || !scr) return;
    sheetKey = key;
    closeOverlay(function () { scr.insertAdjacentHTML('beforeend', html); pinSheetTops(scr); autoIn(scr.querySelector('.j-ov:last-child')); });
  }
  function toast(text) {
    var scr = $('pt-phone').querySelector('.u-scr');
    if (!scr) return;
    var old = scr.querySelector('.j-toast');
    if (old) old.remove();
    scr.insertAdjacentHTML('beforeend', '<p class="j-toast">' + esc(text) + '</p>');
    var t = scr.querySelector('.j-toast');
    setTimeout(function () { if (t) t.remove(); }, 1900);
  }
  /* a tap on nothing shows where you can tap, as Figma's prototype mode does */
  function hint() {
    var ph = $('pt-phone');
    ph.classList.remove('is-hinting');
    void ph.offsetWidth;
    ph.classList.add('is-hinting');
    setTimeout(function () { ph.classList.remove('is-hinting'); }, 900);
  }
  /* v03: leaving setup part way. Today keeps setup where it truly stopped:
     the step on screen, counted as done if its device had already
     connected. From step 6 (or once the scale is in) setup is done, and
     Today is the day-one home. Any way out goes here: the ‹ before
     "Step n of 6", the home indicator, a ✕ */
  function setupStep(id) {
    if (id === '1B') return { n: 0 };
    var m = /^1B-s(\d)[abc]?$/.exec(id || '');
    if (m) return { n: +m[1] };
    if (/^1B\.(far|warm|hot|ok)$/.test(id || '')) return { n: 3, ok: id === '1B.ok' };
    return null;
  }
  function leaveSetup() {
    var st = setupStep(cur);
    if (!st || typeof UI2 === 'undefined') return null;
    if (st.n === 0) return 'ck-1-resume@0';
    var ph = $('pt-phone');
    var ok = st.ok || !!ph.querySelector('.j-dd.is-done, .j-wait-btn:not(.is-gated)');
    var done = ok ? st.n : st.n - 1;
    /* stopped after the patch is the stream's own Resume Setup moment */
    return done >= 5 ? 'ck-1' : done === 3 ? 'ck-1-resume' : UI2['ck-1-resume@' + done] ? 'ck-1-resume@' + done : null;
  }
  var taskHome = null;
  function tap(action, el) {
    var k = action.indexOf(':'), verb = k < 0 ? action : action.slice(0, k), arg = k < 0 ? '' : action.slice(k + 1);
    if (verb === 'view' && arg === 'ck-1-resume' && setupStep(cur)) { var lv = leaveSetup(); if (lv) arg = lv; }
    /* from inside a sheet, to another sheet or page of it: remember where
       it was, for the sheet's ‹. Closing the sheet forgets */
    var inSheet = el && el.closest && el.closest('.j-ov');
    /* a step that moves on (a confirm, a system prompt) starts afresh: no ‹ back to it */
    if (inSheet && el.closest('[data-fresh], .j-ov--sys')) sheetStack = [];
    else if (inSheet && sheetKey && (verb === 'sheet' || verb === 'swap' || verb === 'page')) {
      var pg0 = el.closest('[data-page]');
      sheetStack.push({ key: sheetKey, page: pg0 ? pg0.getAttribute('data-page') : null });
    } else if (verb === 'close' || (!inSheet && verb !== 'sheetback')) sheetStack = [];
    if (verb === 'sheetback') {
      var prev = sheetStack.pop();
      if (!prev) return;
      if (prev.key !== sheetKey) swapOverlay(prev.key);
      var pgEl = $('pt-phone').querySelector('.j-ov [data-page]');
      if (prev.page !== null && pgEl) pgEl.setAttribute('data-page', prev.page);
      var b = $('pt-phone').querySelector('.j-ov .j-sh__b');
      if (b && !sheetStack.length) { b.parentNode.classList.remove('has-back'); b.remove(); }
      return;
    }
    /* a task opened from a day's home comes back to that day when done
       (30.OCT.2026): the questionnaire's Done goes to day 6 (ck-2) in the
       stream, so from day 1 it returns to day 1 with it checked off, and
       from another day's home to that home */
    if (verb === 'view' && (isHome(cur) || /^home@/.test(cur)) && !(isHome(arg) || /^home@/.test(arg))) taskHome = cur;
    /* 30.OCT.2026: the home the questionnaire was opened from is the one
       just before its screens in the trail, never one left earlier (a
       stale day 30); opened some other way (the app map), Today for the
       day on the timeline */
    if (verb === 'view' && arg === 'ck-2' && /^q-done/.test(cur)) {
      var qi = trail.length - 1;
      while (qi >= 0 && /^(q\d|q-|4D)/.test(trail[qi].id)) qi--;
      var from = qi >= 0 && (isHome(trail[qi].id) || /^home@/.test(trail[qi].id)) ? trail[qi].id : null;
      var hd = from && /^home@(\d+)$/.exec(from);
      if (from === 'ck-1') arg = UI2['ck-1-q'] ? 'ck-1-q' : from;
      else if (hd && window.homeDoneQ) arg = window.homeDoneQ(+hd[1]);
      else if (from && from !== 'ck-2-0') arg = from;
      else if (!from && window.homeDoneQ) arg = window.homeDoneQ(shownDay());
    }
    if (verb === 'view') { trail.push({ a: area, i: i, id: cur }); navDir = 'fwd'; goTo(arg); }
    /* home: the checklist for this point of the stream */
    /* 30.OCT.2026: from a reading or a questionnaire, the Today it was
       opened from (the day on the timeline), else that day's home */
    else if (verb === 'home') {
      var hi = trail.length - 1;
      while (hi >= 0 && /^(5B|rd|10B|10C|ins\.|q\d|q-|4D)/.test(trail[hi].id)) hi--;
      var hFrom = hi >= 0 && hi < trail.length - 1 && (isHome(trail[hi].id) || /^home@/.test(trail[hi].id)) ? trail[hi].id : null;
      navDir = 'fade'; goTo(hFrom || homeNow());
    }
    /* back: where you were before this screen; at the start, the step before */
    else if (verb === 'back') {
      if (!trail.length) { go(-1); return; }
      var e = trail.pop();
      navDir = 'back';
      if (e.a !== area || e.i !== i) { setArea(e.a); i = e.i; show(); }
      if (cur !== e.id) render(e.id);
    }
    /* tab:0 Home (this moment's home), tab:1 Resources (as it is today) */
    /* a tab switch is its own motion: the bar stays, the page slides a
       little toward the tab chosen (journey-v03.css) */
    else if (verb === 'tab') { closeOverlay(); navDir = +arg === 1 ? 'tab-r' : 'tab-l'; tabTo(+arg); }
    else if (verb === 'toggle' && el) {
      var opened = el.classList.toggle('is-open');
      if (el.getAttribute('role') === 'switch') el.setAttribute('aria-checked', String(opened));
    }
    else if (verb === 'open') {
      /* open an expanding row elsewhere on the screen, and bring it into view */
      var row = $('pt-phone').querySelector('#' + arg);
      if (row) {
        row.classList.add('is-open');
        /* scroll the phone screen only, not the page around it (rects are zoomed) */
        var body = row.closest('.u-body'), z = parseFloat(getComputedStyle($('pt-phone')).zoom) || 1;
        /* land just below the sticky title, not under it */
        var hd = body && body.querySelector('.j-hd'), gap = (hd ? hd.offsetHeight : 0) + 12;
        if (body) body.scrollTo({ top: body.scrollTop + (row.getBoundingClientRect().top - body.getBoundingClientRect().top) / z - gap });
      }
    }
    else if (verb === 'on' || verb === 'off') {
      var scr = $('pt-phone').querySelector('.u-scr');
      if (scr) scr.classList.toggle(arg, verb === 'on');
    }
    else if (verb === 'sheet') openOverlay(arg);
    /* step: run this screen's next stage (a prototype tap in place of a wait) */
    else if (verb === 'step') {
      var st = $('pt-phone').querySelector('[data-step]');
      if (st) tap(st.getAttribute('data-step'));
    }
    /* today: the checklist for this point of the stream */
    else if (verb === 'today') { trail.push({ a: area, i: i, id: cur }); navDir = 'fade'; goTo(homeNow()); }
    /* a reading's back arrow (30.OCT.2026): back to the Today it was opened
       from, else Today for the day on the timeline, never the step before
       it in the flow (Resources) */
    else if (verb === 'rdback') {
      var lastT = trail[trail.length - 1];
      if (lastT && (isHome(lastT.id) || /^home@/.test(lastT.id))) { tap('back'); return; }
      trail = []; navDir = 'back'; goTo(homeNow());
    }
    else if (verb === 'swap') swapOverlay(arg);
    /* the skip sheet's two answers */
    else if (verb === 'skipq') {
      var take = arg === 'take' && skipRow && skipRow.getAttribute('data-tap');
      closeOverlay(function () { if (take) { skipRow = null; tap(take); } else if (arg !== 'take') skipNow(); });
    }
    /* morph:<id>: swap the screen's [data-morph] block for UI2X[id], in place */
    else if (verb === 'morph') {
      var mt = $('pt-phone').querySelector('[data-morph]');
      if (mt && typeof UI2X !== 'undefined' && UI2X[arg]) { mt.innerHTML = UI2X[arg]; autoIn(mt); skipState(); toEnd(); }
    }
    /* unlock:<gate>: close the panel and switch on the buttons waiting for it */
    else if (verb === 'unlock') closeOverlay(function () {
      $('pt-phone').querySelectorAll('[data-gate="' + arg + '"]').forEach(function (b) { b.classList.remove('is-gated'); });
    });
    else if (verb === 'close') closeOverlay();
    else if (verb === 'toast') toast(arg);
    /* newin:<day>: Resources as it is that day, scrolled to the rows that
       opened then, which blink a few times */
    else if (verb === 'newin') { navDir = 'tab-r'; goTo('res-hub'); setTimeout(function () { litNew(+arg); }, 40); }
    /* tv:<day>.<answer>: today's trivia, answered in its own card */
    else if (verb === 'tv' && window.triviaResult) {
      var tc = (el && el.closest('.j-tvc')) || $('pt-phone').querySelector('.j-tvc'), tv = arg.split('.');
      if (tc) { tc.innerHTML = window.triviaResult(+tv[0], +tv[1]); tc.classList.add('is-answered'); }
    }
    /* page:n turns a paged sheet in place, without closing it */
    else if (verb === 'page' && el) { var pg = el.closest('[data-page]'); if (pg) pg.setAttribute('data-page', arg); pinSheetTops($('pt-phone')); }
  }

  /* a view that is one of this phase's concepts moves the flow there, so
     the scene on the left follows; anything else just swaps the screen.
     v03, one app: looking something up never moves time. Only the next
     step, this step (or the one this detour left) and this step's detours
     move the story; any other screen, a Resources copy ("res.<id>")
     included, opens in place at this moment */
  function goTo(id) {
    /* Resources is the page as it is on this moment's day; at the day-16
       moment itself, that moment */
    if (id === 'res-hub' && typeof resPage === 'function' && mainOf(here()).id !== 'res-hub') {
      var rd = 'res-hub@' + shownDay();
      if (!UI2[rd]) UI2[rd] = resPage('', '', shownDay());
      render(rd); return;
    }
    /* This week and This month (the views menu) are drawn for this moment's
       day; at their own moments (6A, the week strip, day 7) the step itself */
    if ((id === '6A' || id === '1A') && typeof weekView === 'function' && mainOf(here()).id !== id) {
      var vd = shownDay(), vk = id + '@' + vd;
      if (!UI2[vk]) UI2[vk] = id === '6A' ? weekView(vd) : monthView(vd);
      render(vk); return;
    }
    /* a vital's trend and readings, from its tile: drawn for this day */
    if (/^tr-/.test(id) && typeof trendView === 'function') {
      var td = shownDay(), tk = id + '@' + td;
      if (!UI2[tk]) UI2[tk] = trendView(id.slice(3), td);
      render(tk); return;
    }
    /* Status, Earnings and What you've done are drawn for the day on show,
       unless this is their own moment */
    if (window.pageAt && mainOf(here()).id !== id.replace(/^res\./, '')) {
      var pa = window.pageAt(resCopy(id), shownDay());
      if (pa !== resCopy(id)) { render(pa); return; }
    }
    var base = id.replace(/^res\./, '');
    var st = base === id && byId(base), me = here(), mo = mainOf(me);
    if (st && (st === me || st === mo || st === nextMain() || st.d === mo.id)) { setArea(st.a); i = st.k; show(); }
    else render(resCopy(id));
  }
  /* a screen that sits on the Resources tab with no way back of its own
     (Earnings, the tally, What changed, Share the study…) opens as its
     Resources copy when tapped from elsewhere, so the tab that is lit and
     the back link agree: ‹ Resources lands on the Resources page */
  function resCopy(id) {
    if (typeof UI2 === 'undefined' || id.indexOf('res.') === 0 || !UI2['res.' + id]) return id;
    return tabOf(id) === 1 && screenOf(id).indexOf('class="u-back"') < 0 ? 'res.' + id : id;
  }
  /* which tab a concept's screen sits on (-1 if it has no tab bar) */
  function tabOf(id) {
    var d = document.createElement('div');
    d.innerHTML = screenOf(id);
    var on = d.querySelector('.j-tabs > span.is-on');
    return on ? Array.prototype.indexOf.call(on.parentNode.children, on) : -1;
  }
  /* a scroll that eases to a place over 0.45s on a timer, so it runs even
     where the browser's own smooth scroll doesn't; shared with the twin */
  var glide = window.ptGlide = function (el, to) {
    var from = el.scrollTop, t0 = Date.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
    to = Math.max(0, Math.min(to, el.scrollHeight - el.clientHeight));
    (function step() {
      var k = dur ? Math.min(1, (Date.now() - t0) / dur) : 1;
      el.scrollTop = from + (to - from) * (1 - Math.pow(1 - k, 3));
      if (k < 1) setTimeout(step, 16);
    })();
  };
  /* where to scroll so the new rows show whole: their section's heading
     8px under the sticky title (not behind it); if the rows run past the
     tab bar, the first row still shows whole. Shared with the twin */
  var newTop = window.ptNewTop = function (b) {
    var rows = b.querySelectorAll('.j-blink');
    if (!rows.length) return b.scrollTop;
    var s = b.getBoundingClientRect().height / (b.offsetHeight || 1) || 1;
    var hd = b.querySelector('.j-hd'), under = hd ? hd.getBoundingClientRect().bottom : b.getBoundingClientRect().top;
    var first = rows[0], grp = first.closest('.j-ress'), sec = grp && grp.previousElementSibling;
    var anchor = sec && sec.matches('.u-sec, .j-sec, p, h3') && grp.firstElementChild === first ? sec : first;
    var to = b.scrollTop + (anchor.getBoundingClientRect().top - under - 8) / s;
    /* the block's bottom in view too, if that doesn't push the first row under the title */
    var room = (b.getBoundingClientRect().bottom - under) / s - 16;
    var span = (rows[rows.length - 1].getBoundingClientRect().bottom - anchor.getBoundingClientRect().top) / s;
    if (span > room) to = b.scrollTop + (first.getBoundingClientRect().top - under - 8) / s;
    return to;
  };
  var newStamp = 0;
  function litNew(d) {
    var names = window.unlockedOn ? window.unlockedOn(d) : [], ph = $('pt-phone'), b = ph.querySelector('.u-body');
    /* a module block carries its full name in data-name; its title is short */
    var rows = [].filter.call(ph.querySelectorAll('.j-res'), function (r) { var n = r.getAttribute('data-name') || (r.querySelector('b') || {}).textContent; return n && names.indexOf(n.trim()) >= 0; });
    if (!rows.length || !b) return;
    rows.forEach(function (r) { r.classList.add('j-blink'); });
    /* the twin scrolls itself to the same rows once per stamp (theme-demo-v03.js) */
    rows[0].setAttribute('data-new', String(++newStamp));
    glide(b, newTop(b));
    setTimeout(function () { rows.forEach(function (r) { r.classList.remove('j-blink'); r.removeAttribute('data-new'); }); }, 2400);
  }
  function tabTo(t) {
    /* Home opens the day's checklist; Resources opens the one Resources page */
    if (typeof UI2 !== 'undefined' && UI2['res-hub']) {
      if (t === 1) { goTo('res-hub'); return; }
      /* tab:2, the roadmap toggle on Today (30.OCT.2026): the roadmap for
         the day on show */
      if (t === 2) {
        var rd = shownDay(), rk = '1A@' + rd;
        if (!UI2[rk] && typeof monthView === 'function') UI2[rk] = monthView(rd);
        goTo(UI2[rk] ? rk : '1A'); return;
      }
      goTo(homeNow()); return;
    }
    var n = area.flow.length;
    for (var s = 1; s <= n; s++) {
      var k = (i + s) % n;
      if (tabOf(area.flow[k][0]) === t) { i = k; show(); return; }
    }
    tap('toast:Nothing else here in this phase');
  }

  /* concepts that play through several screens get Skip (the waits) and
     Skip to end (straight to the last screen); keyed by the concept's first
     screen, valued by its last. Other concepts show neither */
  var SKIP_END = { '1B-s1': '1B-s6' };
  function show() {
    var f = area.flow, id = f[i][0];
    /* a step that lives under Resources shows its Resources copy, with the
       way back, however you reach it; Home screens stay as drawn */
    render(typeof UI2 !== 'undefined' && UI2['res.' + id] && tabOf(id) === 1 ? 'res.' + id : id);
    var end = SKIP_END[id];
    $('pt-skip').hidden = $('pt-end').hidden = !end;
    $('pt-end').setAttribute('data-to', end || '');
    var me = here(), mo = mainOf(me);
    /* v03 is one app used over time, not a set of concepts: the eyebrow is
       the part of the study, the title is the moment (the step's punchy
       name stays in the data as an internal label) */
    $('pt-eyebrow').textContent = area.name + ' · ' + area.when + (me.d ? ' · What if' : '');
    fitEyebrow();
    if ($('pt-title').textContent !== f[i][2]) {
      $('pt-title').textContent = f[i][2];
      [$('pt-title'), $('pt-scene')].forEach(function (el) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); });
    }
    /* the whole journey: a group per chapter, a segment per main step (each
       jumps there); then the detours this step has, or the way back from one */
    var mi = MAIN.indexOf(mo);
    /* the part of the study is the eyebrow and the day is the scene's, so the
       bar's own header is only how far along the journey this is */
    $('pt-map').innerHTML = '<div class="pt__map-hd"><em>Moment ' + (mi + 1) + ' of ' + MAIN.length + '</em></div>' +
      '<div class="pt__map-bar">' + JR_AREAS.map(function (a) {
        var steps = MAIN.filter(function (s) { return s.a === a; });
        return '<div class="pt__map-ch' + (a === area ? ' is-here' : '') + '" style="flex:' + steps.length + '" title="' + esc(a.name) + '">' + steps.map(function (s) {
          var m = MAIN.indexOf(s);
          return '<button type="button" data-s="' + STREAM.indexOf(s) + '" class="' + (m < mi ? 'is-past' : m === mi ? 'is-on' : '') + '" title="' + esc(a.name + ': ' + s.f[2]) + '"' +
            (m === mi ? ' aria-current="step"' : '') + ' aria-label="' + esc(a.name + ', ' + s.f[2]) + '"></button>';
        }).join('') + '</div>';
      }).join('') + '</div>' +
      (me.d ? '<div class="pt__map-br"><button type="button" class="is-back" data-s="' + STREAM.indexOf(mo) + '">← Back to ' + esc(mo.f[2].toLowerCase()) + '</button></div>'
        : detoursOf(me).length ? '<div class="pt__map-br"><span>What if…</span>' + detoursOf(me).map(function (s) {
          return '<button type="button" data-s="' + STREAM.indexOf(s) + '">' + esc(s.f[2]) + '</button>';
        }).join('') + '</div>'
        /* always there, empty when this step has no detours, so the header
           keeps one height and the phone never moves between moments */
        : '<div class="pt__map-br is-empty" aria-hidden="true"></div>');
    $('pt-map').setAttribute('aria-label', 'Journey, step ' + (mi + 1) + ' of ' + MAIN.length + (me.d ? ', a detour' : ''));
    var sc = (JR_SCENES[area.n] || {})[id];
    $('pt-when').textContent = sc ? sc[0] : '';
    $('pt-scene').textContent = sc ? sc[1] : '';
    $('pt-when').hidden = $('pt-scene').hidden = !sc;
    var notes = (JR_NOTES[area.n] || {})[id] || [];
    $('pt-notes').innerHTML = notes.map(function (x) {
      return x.s ? '<div class="pt__note-box">' + statTile(x) + '</div>'
        : '<blockquote class="pt__note-box pt__q"><p>“' + esc(x.q) + '”</p>' +
          '<cite>' + esc(x.who) + '</cite></blockquote>';
    }).join('');
    $('pt-notes').hidden = !notes.length;
    if (window.ptHeard) window.ptHeard(notes.length);
    /* the dots are built once per section and then only change state, so
       the current pill can stretch from one dot to the next */
    /* the dots: this chapter's main steps; a detour lights its step's dot */
    var dots = $('pt-dots');
    if (dots.getAttribute('data-area') !== String(area.n)) {
      dots.setAttribute('data-area', area.n);
      dots.innerHTML = f.map(function (s, k) {
        return s[4] && s[4].d ? '' : '<button type="button" data-k="' + k + '" aria-label="' + esc(s[2]) + '"></button>';
      }).join('');
    }
    [].forEach.call(dots.children, function (d) {
      var on = +d.getAttribute('data-k') === mo.k;
      d.classList.toggle('is-on', on);
      if (on) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    if ($('pt-list')) $('pt-list').innerHTML = f.map(function (s, k) {
      return '<li><button type="button" class="' + (k === i ? 'is-on' : '') + '" data-k="' + k + '">' +
        '<span>' + (k + 1) + '</span>' + esc(s[1]) + '</button></li>';
    }).join('');
    fit();
    syncPage();
  }
  /* the eyebrow stays on one line, whole: a long one ("Check-ins and
     wrap-up · Days 30 to 90" in a narrow column) steps its size down to fit */
  function fitEyebrow() {
    var e = $('pt-eyebrow');
    if (!e) return;
    e.style.fontSize = '';
    var size = parseFloat(getComputedStyle(e).fontSize);
    while (e.scrollWidth > e.clientWidth + 1 && size > 9) { size -= 0.5; e.style.fontSize = size + 'px'; }
  }
  window.addEventListener('resize', fitEyebrow);
  /* the phone is drawn at 246x517; scale it to the tallest the modal allows */
  function fit() {
    if (!dlg.open) return;
    var ph = $('pt-phone');
    ph.style.zoom = 1;
    /* desktop: the phone has the modal's full height; narrow: it sits under the title */
    var head = window.innerWidth > 860 ? 0 : dlg.querySelector('.pt__head').offsetHeight + 18;
    /* the arrows sit under the phone: leave room for them as they are
       laid out, so the phone never grows into them */
    var pg = dlg.querySelector('.pt__pager');
    var arrows = pg && pg.offsetHeight ? pg.offsetHeight + (parseFloat(getComputedStyle(pg).marginTop) || 0) : 46;
    /* v03: detours that wrap onto a second line don't shrink the phone, so it
       (and the columns either side) keep one size on every moment */
    var br = pg && pg.querySelector('.pt__map-br');
    if (br && dlg.classList.contains('pt--inline')) arrows -= Math.max(0, br.offsetHeight - 24);
    /* desktop: 30px more at the top, so the phone sits under the buttons at the top right */
    /* inline (v03): the site's top bar and the docked timeline sit above it */
    var above = dlg.classList.contains('pt--inline') ? DOCK_TOP + DOCK_H + 8 : 0;
    var dr = dlg.querySelector('.pt__days');
    if (dr) above += dr.offsetHeight + 8;
    var room = window.innerHeight - above - 32 - head - arrows - 28 - 24 - (window.innerWidth > 860 ? 30 : 0);   /* margins, padding */
    var z = Math.max(1, Math.min(room / 529, 1.9)).toFixed(3);
    ph.style.zoom = z;
    /* a compare step has no phone, but keeps the phone's frame: same
       height, same text column */
    dlg.style.setProperty('--ph-z', z);
    /* the compare screens: as large as the modal allows beside the 296px
       text column (4 across, 16px apart, captions below) */
    if (window.innerWidth > 860) {
      var w = dlg.clientWidth - 64 - 296 - 48 - 24;
      var sc = Math.min((517 * z - 52 - 90) / 517, w / (4 * 246));
      dlg.style.setProperty('--cmp-s', Math.max(.4, Math.min(sc, 1)).toFixed(3));
    } else dlg.style.removeProperty('--cmp-s');
  }
  window.addEventListener('resize', fit);
  /* along the main line, across chapters; from a detour, forward is the
     step after the one it left, back is that step. No wrapping */
  function go(d) {
    var m = mainIdx(), t = here().d ? (d > 0 ? m + 1 : m) : m + d;
    if (t >= 0 && t < MAIN.length) { navDir = d > 0 ? 'fwd' : 'back'; jump(MAIN[t]); }
  }
  /* v03: the prototype lives on the page, under the four stages, always
     open; jumping in moves it to that stage and brings it into view */
  var INLINE = true;
  function open(n, quiet) {
    area = JR_AREAS.find(function (a) { return String(a.n) === String(n); });
    if (!area) return;
    i = 0; trail = []; hist = [];
    $('pt-opp').textContent = area.insight;
    navDir = 'fade';
    if (INLINE) { if (!dlg.open) dlg.setAttribute('open', ''); }
    else dlg.showModal();
    show();
    fit();
    if (INLINE && !quiet) window.scrollTo({ top: window.scrollY + dlg.getBoundingClientRect().top - DOCK_TOP - DOCK_H - 8, behavior: 'smooth' });
  }

  document.addEventListener('pr-feedback-open-screen', function (event) {
    var parts = String(event.detail && event.detail.screen || '').split(':');
    if (parts[0] !== 'v03') return;
    var a = JR_AREAS.find(function (item) { return String(item.n) === parts[1]; });
    var k = a ? a.flow.findIndex(function (step) { return step[0] === parts[2]; }) : -1;
    var day = Number(parts[3]), id = parts.slice(4).join(':');
    if (!a || k < 0 || !Number.isInteger(day) || day < 1 || day > LAST_DAY) return;
    if (!dlg.open) open(a.n, true);
    setArea(a); i = k;
    scrub = { at: here(), day: day };
    show();
    // Day-specific Home and Resources screens are generated on demand.
    if (/^home@/.test(id) && window.homeAt) window.homeAt(day);
    if (/^res-hub@/.test(id) && !UI2[id]) UI2[id] = resPage('', '', day);
    if (/^1A@/.test(id) && !UI2[id] && typeof monthView === 'function') UI2[id] = monthView(day);
    if (screenOf(id) && cur !== id) render(id);
    unschedule(); syncPage(); fit();
  });

  document.addEventListener('click', function (e) {
    /* the whole callout opens it, not just its button */
    var b = e.target.closest('.jr-mark__btn, .jr-walk');
    if (b) open(b.getAttribute('data-area'));
  });
  /* an arrow nudges the way it goes, each time it is pressed */
  function nudge(el) {
    el.classList.remove('is-nudge');
    void el.offsetWidth;
    el.classList.add('is-nudge');
  }
  /* the arrows click through the flow (nextClick, prevClick, below);
     skip moves on a whole concept */
  $('pt-prev').addEventListener('click', function () { nudge(this); prevClick(); });
  $('pt-next').addEventListener('click', function () { nudge(this); nextClick(); });
  $('pt-snext').addEventListener('click', function () { if (nextMain()) { nudge(this); go(1); } });
  $('pt-sprev').addEventListener('click', function () { nudge(this); go(-1); });
  $('pt-phone').addEventListener('click', function (e) {
    var tp = e.target.closest('[data-tap]');
    if (!tp || !/^(toggle|open|toast|page|tv)\b/.test(tp.getAttribute('data-tap'))) remember();
    var gd = e.target.closest('.is-gated');
    if (gd) {
      /* after a failed connection, the same button tries again */
      if (gd.getAttribute('data-retry') && $('pt-phone').querySelector('.j-dd.is-err')) tap(gd.getAttribute('data-retry'));
      else if (gd.getAttribute('data-gate-tap')) tap(gd.getAttribute('data-gate-tap'));
      else toast('Scroll to the end first');
      return;
    }
    var t = e.target.closest('[data-tap]');
    if (t) { tap(t.getAttribute('data-tap'), t); return; }
    /* a task's close button, or the home indicator, goes back to this
       phase's checklist, the home every concept can be reached from */
    if (e.target.closest('.u-x, .j-hi')) {
      var lv = setupStep(cur) && leaveSetup();
      if (lv) { tap('view:' + lv); return; }
      goTo(homeId()); return;
    }
    /* the tab bar moves between this phase's concepts: each tab steps
       through the concepts whose screen sits on that tab */
    var tb = e.target.closest('.j-tabs > span');
    if (tb) { tabTo(Array.prototype.indexOf.call(tb.parentNode.children, tb)); return; }
    /* a demo wait (Searching…, a connecting stage): a tap anywhere moves on */
    var wait = $('pt-phone').querySelector('.j-status[data-tap]');
    if (wait) { wait.click(); return; }
    if ($('pt-phone').querySelector('[data-step]')) { tap('step'); return; }
    /* an interactive screen keeps you on it; the arrows move the flow */
    if ($('pt-phone').querySelector('[data-tap], [data-auto]')) { hint(); return; }
    go(1);
  });
  dlg.addEventListener('scroll', gate, true);
  $('pt-phone').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('pt-phone').click(); }
  });
  ['pt-list', 'pt-dots'].forEach(function (id) {
    if ($(id)) $(id).addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]');
      if (b) { trail = []; hist = []; i = +b.getAttribute('data-k'); show(); }
    });
  });
  /* the journey bar jumps along the main line; a detour opens from its step,
     and its own button returns to that step */
  $('pt-map').addEventListener('click', function (e) {
    var b = e.target.closest('[data-s]');
    if (b) jump(STREAM[+b.getAttribute('data-s')]);
  });
  $('pt-x').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('close', function () { unschedule(); });
  /* the innermost thing closes first: a sheet or notification open in the
     phone closes before the modal, whether by Esc or a click outside */
  var sheetOpen = function () { return !!$('pt-phone').querySelector('.j-ov:not(.is-out)'); };
  /* Esc is caught on the key itself, before the dialog acts on it: the
     dialog's own cancel event can't always be stopped */
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('.pr-feedback-root, .pr-feedback-pins')) return;
    if (e.key !== 'Escape' || !dlg.open || !sheetOpen()) return;
    e.preventDefault(); e.stopPropagation(); closeOverlay();
  }, true);
  dlg.addEventListener('cancel', function (e) {
    if (sheetOpen()) { e.preventDefault(); closeOverlay(); }
  });
  /* the modal closes with Esc, the close button, or a click outside it */
  /* the dialog's own padding is also the dialog, so check the click fell
     outside its box: that is the backdrop */
  dlg.addEventListener('click', function (e) {
    if (e.target !== dlg) return;
    var r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      if (sheetOpen()) closeOverlay(); else dlg.close();
    }
  });
  /* restart: the current screen back to how it opens, sheets closed, rows folded */
  /* restart: this screen as it opens; at the end of the chapter, the
     chapter from its first concept */
  $('pt-re').addEventListener('click', function () {
    if (atStreamEnd()) { jump(MAIN[0]); return; }
    show();
  });
  $('pt-skip').addEventListener('click', skip);
  /* Next click: do what a person would tap next on this screen (the stage
     in progress, a wait, the main button, the current task, a
     notification), within this concept only.
     Previous click: the screen before, within this concept only */
  /* what Next would do on this screen, or null when the concept has no
     more states: a move that would jump to another of this phase's
     concepts (other than the very next one), return to this one's start,
     or go home counts as none, and Next goes to the next concept instead */
  function leaves(act) {
    if (!act) return false;
    if (/^(home|today)\b/.test(act)) return true;
    var m = act.match(/^view:(.+)$/);
    if (!m) return false;
    var st = byId(m[1].replace(/^res\./, ''));
    /* a tap that opens the next step of the main line is followed, as a click would */
    return !!st && st !== nextMain();
  }
  function nextMove() {
    var ph = $('pt-phone');
    /* a screen can name a step to show first (2.8: the study team sheet),
       once per visit */
    var first = ph.querySelector('[data-first]:not(.is-used)');
    if (first && !ph.querySelector('.j-ov')) return function () { first.classList.add('is-used'); tap(first.getAttribute('data-first')); };
    var st = ph.querySelector('[data-step]');
    if (st) return leaves(st.getAttribute('data-step')) ? null : function () { tap('step'); };
    if (autoAct) return leaves(autoAct) ? null : function () { var a = autoAct; unschedule(); tap(a); };
    /* a button marked data-end is where the concept stops: → moves on instead */
    var pick = ph.querySelector('.j-ov .j-nt, .j-ov .j-sh .u-btn:not(.u-btn--ghost)') ||
      ph.querySelector('.j-wait-btn.is-gated[data-retry]') ||
      ph.querySelector('.u-thumb .u-btn:not(.u-btn--ghost):not(.is-gated):not([data-end]), .j-status[data-tap], .j-ck.is-now[data-tap], .j-resume, .j-nt, .j-key--next') ||
      /* a one-tap question: the first answer */
      ph.querySelector('.j-qa[data-tap^="view:"]') ||
      /* a screen that starts with a swipe anywhere (the welcome) */
      ph.querySelector('.j-swipe[data-tap]') ||
      /* any other main button on the screen */
      ph.querySelector('.u-btn[data-tap]:not(.u-btn--ghost):not(.is-gated):not([data-end])') ||
      /* else the spotlit feature (the streak, the trivia) opens */
      ph.querySelector('.j-spot[data-tap]:not(.j-spot--pt)');
    if (!pick) return null;
    var act = pick.getAttribute('data-tap') || pick.getAttribute('data-gate-tap') || '';
    if (pick.matches('.j-wait-btn') && ph.querySelector('.j-dd.is-err')) return function () { pick.click(); };
    if (pick.closest('.j-wait-btn.is-gated') || leaves(act)) return null;
    return function () { pick.click(); };
  }
  /* always clickable: the concept's next state, and once it has none, the
     next concept in order; back the same way to the previous concept */
  function nextClick() {
    var mv = nextMove();
    if (mv) { remember(); mv(); } else if (nextMain()) go(1);
  }
  /* the end of the chapter: its last concept, with no state left. Forward
     greys out (back still works) and Restart is lit */
  function atStreamEnd() { return !!area && !nextMain() && !nextMove(); }
  var endQueued = false;
  function endState() {
    endQueued = false;
    if (!area) return;
    var end = atStreamEnd(), last = !nextMain();
    $('pt-next').classList.toggle('is-off', end);
    $('pt-next').setAttribute('aria-disabled', end);
    $('pt-snext').classList.toggle('is-off', last);
    $('pt-snext').setAttribute('aria-disabled', last);
    $('pt-re').classList.toggle('is-lit', end);
    $('pt-re').title = end ? 'Start the journey again' : 'Restart this screen';
  }
  new MutationObserver(function () {
    if (!endQueued) { endQueued = true; setTimeout(endState, 0); }
  }).observe($('pt-phone'), { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  new MutationObserver(function () {
    if (!endQueued) { endQueued = true; setTimeout(endState, 0); }
  }).observe($('pt-eyebrow'), { childList: true, characterData: true, subtree: true });
  /* spotlit parts of the screen (coach marks): each description sits
     outside the phone, to the right of the last phone showing them, joined
     to its lit box by a horizontal leader line */
  var labQueued = false;
  /* v03: Show highlights is off (disabled) on a screen with none to show,
     an open sheet's included; the on/off choice itself is kept */
  function hlAvail() {
    var b = $('pt-hl'), box = $('pt-cmp');
    if (!b) return;
    var has = !!($('pt-phone').querySelector('.j-spot') || (box && dlg.classList.contains('is-compare') && box.querySelector('.j-spot')));
    if (b.disabled === !has) return;
    b.disabled = !has;
    b.title = has ? (hlOff ? 'Light up the key parts of each screen, with notes' : 'Show the screens without highlights') : 'This screen has no highlights';
  }
  function spotLabel() {
    labQueued = false;
    var stage = dlg.querySelector('.pt__stage');
    if (!stage) return;
    var olds = [].slice.call(stage.querySelectorAll('.pt__spotlab'));
    var phones = [].filter.call(stage.querySelectorAll('.pt__phone'), function (p) {
      return p.offsetParent && p.querySelector('.j-spot__tip');
    });
    var ph = phones[phones.length - 1];
    /* a panel open over the screen: only what is lit inside it is labelled;
       nothing with highlights turned off */
    var ov = ph && ph.querySelector('.j-ov:not(.is-out)');
    var spots = ph && dlg.open && !dlg.classList.contains('no-spot') && !dlg.classList.contains('is-compare') ? [].slice.call((ov || ph).querySelectorAll('.j-spot')).filter(function (sp) { return sp.querySelector('.j-spot__tip'); }) : [];
    olds.slice(spots.length).forEach(function (o) { o.remove(); });
    if (!spots.length) return;
    var st = stage.getBoundingClientRect(), pr = ph.getBoundingClientRect();
    spots.forEach(function (spot, n) {
      /* its own description, not one of a spot inside it */
      var tip = spot.querySelector(':scope > .j-spot__tip') || spot.querySelector('.j-spot__tip');
      var lab = olds[n];
      if (!lab) { lab = document.createElement('div'); lab.className = 'pt__spotlab'; lab.setAttribute('aria-hidden', 'true'); lab.innerHTML = '<i></i><p></p>'; stage.appendChild(lab); }
      /* the words only: the phone's own type classes stay in the phone */
      var words = tip.innerHTML.replace(/\sclass="[^"]*"/g, '');
      if (lab.querySelector('p').innerHTML !== words) lab.querySelector('p').innerHTML = words;
      /* the line meets the middle of the part of the box in view; scrolled
         out of the screen, or under the sticky title, no label */
      var sr = spot.getBoundingClientRect();
      var hd = !ov && ph.querySelector('.j-hd'), top = hd ? hd.getBoundingClientRect().bottom : pr.top + 20;
      /* and the bottom: the tab bar, or a bottom bar that stays put */
      var bot = pr.bottom - 20;
      if (!ov) [].forEach.call(ph.querySelectorAll('.j-tabs, .u-thumb'), function (f) {
        if (f.contains(spot) || getComputedStyle(f).position === 'static' && !f.classList.contains('j-tabs')) return;
        bot = Math.min(bot, f.getBoundingClientRect().top);
      });
      var a = Math.max(sr.top, top), z = Math.min(sr.bottom, bot), y = (a + z) / 2;
      lab.hidden = z - a < Math.min(12, sr.height - 2);
      var x1 = sr.right - st.left, x2 = pr.right - st.left + 28;
      lab.style.top = (y - st.top) + 'px';
      lab.style.left = x1 + 'px';
      lab.querySelector('i').style.width = (x2 - x1) + 'px';
      lab.querySelector('p').style.transform = '';
      /* never past the box's right edge: a narrow window wraps the note instead */
      lab.querySelector('p').style.maxWidth = Math.max(120, dlg.getBoundingClientRect().right - 24 - (pr.right + 28 + 10)) + 'px';
    });
    /* labels close together push apart, top to bottom; the text moves, the
       leader line stays level with its box */
    var shown = [].filter.call(stage.querySelectorAll('.pt__spotlab'), function (l) { return !l.hidden; })
      .map(function (l) { var p = l.querySelector('p'), r = p.getBoundingClientRect(); return { p: p, top: r.top, h: r.height }; })
      .sort(function (a, b) { return a.top - b.top; });
    var floor = -Infinity;
    shown.forEach(function (o) {
      var shift = Math.max(0, floor + 12 - o.top);
      if (shift) o.p.style.transform = 'translateY(' + shift + 'px)';
      floor = o.top + shift + o.h;
    });
  }
  /* highlights on or off, remembered on this browser; v03 starts with them
     off (one app, not features to point at), under its own key so v02 keeps its own */
  var hlOff = true;
  try { hlOff = localStorage.getItem('pt3-highlights') !== '1'; } catch (e) {}
  function applyHl() {
    dlg.classList.toggle('no-spot', hlOff);
    $('pt-hl').textContent = hlOff ? 'Show highlights' : 'Hide highlights';
    /* pressed while hidden, as Show before is, so the two toggles share one look */
    $('pt-hl').setAttribute('aria-pressed', String(hlOff));
    $('pt-hl').title = hlOff ? 'Light up the key parts of each screen, with notes' : 'Show the screens without highlights';
    queueLabel();
  }
  $('pt-hl').addEventListener('click', function () {
    hlOff = !hlOff;
    try { localStorage.setItem('pt3-highlights', hlOff ? '0' : '1'); } catch (e) {}
    applyHl();
  });
  function queueLabel() { hlAvail(); if (!labQueued) { labQueued = true; requestAnimationFrame(spotLabel); } }
  new MutationObserver(queueLabel).observe(dlg, { childList: true, subtree: true });
  dlg.addEventListener('scroll', queueLabel, true);
  window.addEventListener('resize', queueLabel);
  applyHl();
  function prevClick() {
    /* the screen before, as it was, sheets and in-place stages included */
    if (restore()) return;
    if ($('pt-phone').querySelector('.j-ov')) { closeOverlay(); return; }
    if (trail.length) tap('back'); else go(-1);
  }
  $('pt-end').addEventListener('click', function () {
    var to = $('pt-end').getAttribute('data-to');
    if (to && cur !== to) { unschedule(); tap('view:' + to); }
  });
  /* v03: the Prolaio twin runs taps the real screen doesn't carry (its top
     bar's ☰, ?, bell and gear) through here */
  window.ptTap = function (action) { remember(); tap(action); };
  /* v03: skipping today's questionnaire (the twin's Skip). First a sheet
     says what skipping means; Skip for today marks the task skipped, set
     below what is still to do, and a notification banner confirms it and
     says when the next one opens. Take it now starts it instead */
  var skipRow = null;
  window.ptSkipTask = function (row) {
    if (!row || !$('pt-phone').contains(row)) return;
    remember();
    skipRow = row;
    openOverlay('q-skip');
  };
  function skipNow() {
    var row = skipRow;
    skipRow = null;
    if (!row || !$('pt-phone').contains(row)) return;
    row.classList.remove('is-now', 'is-tap');
    row.classList.add('is-skip');
    row.removeAttribute('data-tap');
    var em = row.querySelector('.j-ck__t em'), end = row.querySelector('.j-ck__end');
    if (em) em.textContent = 'Skipped today';
    if (end) end.innerHTML = '';
    if (row.parentNode) row.parentNode.appendChild(row);
    banner('Questionnaire skipped', 'The next one opens Wednesday at 8:00 AM.');
  }
  /* an in-app notification: slides in at the top, then goes */
  function banner(title, line) {
    var scr = $('pt-phone').querySelector('.u-scr');
    if (!scr) return;
    var old = scr.querySelector('.j-bn');
    if (old) old.remove();
    scr.insertAdjacentHTML('beforeend', '<div class="j-bn" role="status"><i>P</i><div><p class="j-bn__a">Prolaio <em>now</em></p><b>' + esc(title) + '</b><span>' + esc(line) + '</span></div></div>');
    var b = scr.querySelector('.j-bn');
    setTimeout(function () { if (b) b.classList.add('is-out'); }, 3200);
    setTimeout(function () { if (b) b.remove(); }, 3600);
  }
  /* a swipe up on a swipe-to-start screen (the welcome) runs its tap; a
     mouse swipe already lands as a click, this covers touch. On the real
     phone here, on the Prolaio twin in theme-demo-v03.js */
  window.ptSwipe = function (el) {
    var y0 = null, sx = null;
    el.addEventListener('pointerdown', function (e) { var s = e.target.closest('.j-swipe[data-tap]'); y0 = s ? e.clientY : null; sx = s; });
    el.addEventListener('pointerup', function (e) {
      if (e.pointerType !== 'mouse' && y0 !== null && sx && y0 - e.clientY > 30) { e.preventDefault(); window.ptTap(sx.getAttribute('data-tap')); }
      y0 = null; sx = null;
    });
    el.addEventListener('pointercancel', function () { y0 = null; sx = null; });
  };
  window.ptSwipe($('pt-phone'));
  /* a fun fact turns over by itself every 3 seconds while it shows (its ↻
     still gives another straight away), so a wait never sits on one fact
     (10 seconds until 30.OCT.2026) */
  setInterval(function () {
    if (!area || document.hidden) return;
    var nx = $('pt-phone').querySelector('.j-rd__fact .j-fact__new[data-tap^="morph:"]');
    if (nx && !$('pt-phone').querySelector('.j-ov:not(.is-out)')) nx.click();
  }, 3000);

  /* ------------------------------------------------------- page sync (v03).
     As the prototype moves: a line on the journey map at this moment's day,
     this stage's card lit, and the explainers below marking where you are */
  var nowLine = null;
  function dayX(day) {
    /* the journey's day columns: Day 1, Week 1, Weeks 2-4, Day 30, Day 60,
       Day 90, then the renewals: Day 180 (days 91 to 180), 1 year (to 360),
       2 years (to 720) */
    var cols = document.querySelectorAll('.jr > .jr-cycle'), grid = document.querySelector('.jr');
    if (!grid || cols.length < 6 || !grid.offsetParent) return null;
    var span = day <= 1 ? [0, .5] : day <= 8 ? [1, (day - 2) / 6] : day <= 29 ? [2, (day - 9) / 20]
      : day <= 59 ? [3, (day - 30) / 30] : day <= 89 ? [4, (day - 60) / 30] : day <= 90 || cols.length < 9 ? [5, .5]
      : day <= 180 ? [6, (day - 91) / 89] : day <= 360 ? [7, (day - 181) / 179] : [8, (day - 361) / 359];
    var g = grid.getBoundingClientRect(), c = cols[span[0]].getBoundingClientRect();
    return c.left - g.left + Math.max(0, Math.min(1, span[1])) * c.width;
  }
  function syncPage() {
    if (!area) return;
    var day = shownDay(), grid = document.querySelector('.jr'), x = dayX(day);
    if ($('pt-day')) {
      $('pt-day').textContent = 'Day ' + day + (typeof dateOf === 'function' ? ' · ' + shortDate(dateOf(day)) : '');
      dlg.querySelectorAll('.pt__day').forEach(function (b) { b.disabled = b.getAttribute('data-d') < 0 ? day <= 1 : day >= LAST_DAY; });
    }
    if (grid && !nowLine) {
      nowLine = document.createElement('div');
      nowLine.className = 'jr-now'; nowLine.setAttribute('aria-hidden', 'true');
      nowLine.innerHTML = '<span role="slider" tabindex="0" aria-label="Study day" aria-valuemin="1" aria-valuemax="' + LAST_DAY + '"></span>';
      grid.appendChild(nowLine);
    }
    if (nowLine) {
      nowLine.hidden = x === null;
      if (x !== null) {
        nowLine.style.left = x + 'px';
        nowLine.style.height = grid.offsetHeight + 'px';
        nowLine.querySelector('span').textContent = 'Day ' + day;
        nowLine.querySelector('span').setAttribute('aria-valuenow', day);
      }
    }
    document.querySelectorAll('.jr-mark').forEach(function (m) { m.classList.toggle('is-now', m.getAttribute('data-area') === String(area.n)); });
    /* past day 90 the eyebrow names the renewal: "Renewal · Cycle 2 · Days
       91 to 180"; back inside the first 90 days it is the part's again */
    var eb = $('pt-eyebrow');
    if (eb && day > 90) {
      var cy = Math.ceil(day / 90), t = 'Cycle ' + cy + ' · Days ' + ((cy - 1) * 90 + 1) + ' to ' + cy * 90;
      if (eb.textContent !== t) { eb.textContent = t; eb._rn = true; fitEyebrow(); }
    } else if (eb && eb._rn) {
      eb._rn = false;
      eb.textContent = area.name + ' · ' + area.when + (here().d ? ' · What if' : '');
      fitEyebrow();
    }
    wires();
    features(day);
    if (dock) dockMarker(); else buildDock();
    alignHeads();
  }
  /* the two side panels' titles (where you are, available features) on one
     line: the feature list drops to the flowchart's rule, wherever the
     title above the flowchart ends (one line or two) */
  function alignHeads() {
    var where = $('pt-where'), feat = $('pt-feat');
    if (!where || !feat) return;
    if (!INLINE || window.innerWidth <= 860 || !where.offsetParent || !feat.offsetParent) { feat.style.marginTop = ''; return; }
    /* the map's rule 16px under the moment's note, where its words end, not
       under the three lines the note keeps room for (23.OCT.2026) */
    var sc = $('pt-scene');
    if (sc && sc.offsetParent) {
      var rg = document.createRange(); rg.selectNodeContents(sc);
      var tb = rg.getBoundingClientRect().bottom || sc.getBoundingClientRect().bottom;
      var wm = parseFloat(getComputedStyle(where).marginTop) || 0, dw = tb + 16 - where.getBoundingClientRect().top;
      if (Math.abs(dw) > .5) where.style.marginTop = (wm + dw) + 'px';
    }
    /* from where it is now: the flowchart can move with the list's margin;
       the list rises with it, but never into the toggles above it */
    var m = parseFloat(feat.style.marginTop) || 0, ft = feat.getBoundingClientRect().top;
    var d = where.getBoundingClientRect().top - ft, tl = dlg.querySelector('.pt__tools');
    if (tl && tl.offsetParent) d = Math.max(d, tl.getBoundingClientRect().bottom + 12 - ft);
    if (Math.abs(d) > .5) feat.style.marginTop = (m + d) + 'px';
    /* What we heard, at the foot of the left column, sits level with the
       first round button in the row under the phone (23.OCT.2026) */
    var hd = dlg.querySelector('.pt__heard--foot'), pb = dlg.querySelector('.pt__pager button');
    if (hd && pb && pb.offsetParent) {
      var hm = parseFloat(hd.style.marginTop) || 16, a = pb.getBoundingClientRect(), h = hd.getBoundingClientRect();
      var dh = (a.top + a.height / 2) - (h.top + h.height / 2);
      if (Math.abs(dh) > .5) hd.style.marginTop = Math.max(0, hm + dh) + 'px';
    }
  }
  window.addEventListener('resize', alignHeads);
  if (window.ResizeObserver) new ResizeObserver(alignHeads).observe(dlg.querySelector('.pt__body') || dlg);
  /* the right panel: what the app has open by this moment, from the unlock
     map. Open ones are lit (new this week marked), the rest say when they
     open. Every row is a link: one with a moment jumps there (a coming one
     jumps ahead to when it opens); one without opens in place */
  /* the rows with no screen of their own: where each one is seen */
  var FEAT_GO = { 'Readings and questionnaires': '5B', 'Help and the study team': 'sheet:help3', 'Monthly report': '14A' };
  /* where each feature lives in the app, said on hover when it isn't on the screen showing */
  /* kept short: the hovered row stays on one line */
  var FEAT_WHERE = { 'Daily checklist': 'Today', 'Readings and questionnaires': 'Today',
    'Help and the study team': 'top bar, ?', 'Health dashboard': 'Today',
    'Earnings tracker': 'Today, Library', 'Daily trivia': 'Today', 'Community': 'Today, Library',
    'Referral': 'Library', 'Resources hub': 'Library tab', 'Streaks': 'Today, Library',
    'Contribution tally': 'Today, Library', 'Monthly report': 'Today, Library' };
  var FEATS = [];
  JR_MAPS['unlock-map'].groups.forEach(function (g) { g[1].forEach(function (r) { FEATS.push(r); }); });
  FEATS.sort(function (a, b) { return (a[4] || a[2] * 7 + 1) - (b[4] || b[2] * 7 + 1); });
  function features(day) {
    var box = $('pt-feat');
    if (!box) return;
    var weeks = JR_MAPS['unlock-map'].weeks;
    /* the day a feature opens: its own day (trivia day 3, community day 7),
       else the first day of its week */
    var openOf = function (f) { return f[4] || f[2] * 7 + 1; };
    /* two short lists, open now and coming up: an open row is only its name
       (marked New for the week after it opens); a coming one says when */
    var row = function (f) {
      /* New for a week after it opens; what's there from day 1 never is */
      var o = openOf(f), on = o <= day, fresh = on && o > 1 && day - o < 7;
      /* a feature with no moment of its own (referral) opens in place, under
         Resources; Help opens its sheet */
      var to = FEAT_GO[f[1]] || f[0], st = byId(to);
      var go = /^sheet:/.test(to) ? ' data-v="' + to + '"' : st ? ' data-s="' + STREAM.indexOf(st) + '"'
        : UI2['res.' + to] ? ' data-v="res.' + to + '"' : '';
      if (go) go += ' role="button" tabindex="0"';
      return '<li class="' + (on ? 'is-on' : 'is-later') + (fresh ? ' is-new' : '') + (go ? ' is-go' : '') + '"' + go + '>' +
        '<i aria-hidden="true"></i><b' + (FEAT_WHERE[f[1]] ? ' data-where="' + esc(FEAT_WHERE[f[1]]) + '"' : '') + '>' + esc(f[1]) + '</b>' +
        (fresh ? '<em>New</em>' : on ? '' : '<em>' + esc(f[4] ? 'Day ' + f[4] : weeks[f[2]]) + '</em>') + '</li>';
    };
    var opened = FEATS.filter(function (f) { return openOf(f) <= day; }), coming = FEATS.filter(function (f) { return openOf(f) > day; });
    box.innerHTML = '<p class="pt__feat-k">Available features<b>' + opened.length + ' of ' + FEATS.length + '</b></p>' +
      '<ol class="pt__feat-l">' + opened.map(row).join('') + '</ol>' +
      (coming.length ? '<p class="pt__feat-k pt__feat-k--soon">Locked features</p><ol class="pt__feat-l">' + coming.map(row).join('') + '</ol>' : '');
  }
  function featGo(li) {
    var v = li.getAttribute('data-v');
    if (v && /^sheet:/.test(v)) openOverlay(v.slice(6));
    else if (v) closeOverlay(function () { goTo(v); });
    else jump(STREAM[+li.getAttribute('data-s')]);
  }
  /* hovering (or focusing) a feature lights where it lives on the phone
     showing, if it's on this screen (22.OCT.2026). Each feature: selectors,
     and optionally words the element must contain */
  var FEAT_ON = {
    'Daily checklist': [['.j-cks']],
    'Readings and questionnaires': [['.j-ck', /blood pressure|weight|reading|questionnaire/i], ['.j-rd__art'], ['.j-qlist']],
    'Help and the study team': [['.pr-tbar__i[aria-label="Help"]'], ['.j-help']],
    'Health dashboard': [['.j-dbs'], ['.j-dash']],
    'Earnings tracker': [['.j-hs__i', /earned/i], ['.u-num']],
    'Referral': [['.j-drawer__i', /referral/i], ['.j-res', /referral/i], ['.j-menu']],
    'Resources hub': [['.j-tabs > span:nth-child(2)']],
    'Streaks': [['.j-sk__mini'], ['.j-hs__i', /streak/i], ['.j-sk']],
    'Daily trivia': [['.u-card', /trivia/i], ['.j-tvs']],
    'Contribution tally': [['.j-hs__i', /days of data/i], ['.j-jg']],
    'Community': [['.j-res', /questions from other participants|community/i], ['.u-card', /community|thread/i], ['.j-ths']],
    'Monthly report': [['.j-r30'], ['.j-nr'], ['.u-card', /report/i]],
  };
  var featLit = [];
  function featLight(name) {
    featLit.forEach(function (el) { el.classList.remove('is-feat-hl'); });
    featLit = [];
    if (!name || !FEAT_ON[name]) return false;
    var stage = dlg.querySelector('.pt__stage');
    var ph = (stage && stage.classList.contains('td-on') && dlg.querySelector('.td-ph')) || $('pt-phone');
    for (var r = 0; r < FEAT_ON[name].length && !featLit.length; r++) {
      var sel = FEAT_ON[name][r][0], words = FEAT_ON[name][r][1];
      [].forEach.call(ph.querySelectorAll(sel), function (el) {
        if (featLit.length || (words && !words.test(el.textContent + ' ' + (el.getAttribute('aria-label') || '')))) return;
        if (!el.getClientRects().length) return;
        featLit.push(el);
      });
    }
    featLit.forEach(function (el) {
      el.classList.add('is-feat-hl');
      /* bring it into view inside the phone's own scroll, not the page's */
      var body = el.closest('.u-body');
      if (body) {
        var b = body.getBoundingClientRect(), e = el.getBoundingClientRect();
        if (e.top < b.top || e.bottom > b.bottom) body.scrollTop += (e.top - b.top) - b.height / 3;
      }
    });
    return featLit.length > 0;
  }
  if ($('pt-feat')) {
    ['mouseover', 'focusin'].forEach(function (ev) {
      $('pt-feat').addEventListener(ev, function (e) {
        var li = e.target.closest('li');
        if (!li) return;
        var found = featLight((li.querySelector('b') || {}).textContent);
        li.classList.toggle('is-absent', !found);
      });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      $('pt-feat').addEventListener(ev, function () { featLight(null); });
    });
    /* a row cut short (its hover note, a long name) shows whole after a
       second's hover, in a box under it */
    var tip = null, tipFor = null, tipT = 0;
    var hideTip = function () { clearTimeout(tipT); tipFor = null; if (tip) tip.hidden = true; };
    $('pt-feat').addEventListener('mouseover', function (e) {
      var li = e.target.closest('li');
      if (!li || li === tipFor) return;
      hideTip(); tipFor = li;
      tipT = setTimeout(function () {
        var b = li.querySelector('b'), em = li.querySelector('em');
        if (!b || !li.matches(':hover') || b.scrollWidth <= b.clientWidth) return;
        var note = getComputedStyle(b, '::after').content;
        var text = b.textContent + (note && note !== 'none' ? note.slice(1, -1) : '') + (em && em.textContent !== 'New' ? ' · ' + em.textContent : '');
        if (!tip) { tip = document.createElement('div'); tip.className = 'pt-tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
        tip.textContent = text; tip.hidden = false;
        var r = li.getBoundingClientRect();
        tip.style.left = Math.max(8, Math.min(r.left, window.innerWidth - tip.offsetWidth - 8)) + 'px';
        tip.style.top = (r.bottom + 4) + 'px';
      }, 1000);
    });
    $('pt-feat').addEventListener('mouseleave', hideTip);
    window.addEventListener('scroll', hideTip, { passive: true });
  }
  if ($('pt-feat')) {
    $('pt-feat').addEventListener('click', function (e) {
      var li = e.target.closest('[data-s], [data-v]');
      if (li) featGo(li);
    });
    $('pt-feat').addEventListener('keydown', function (e) {
      var li = e.target.closest('[data-s], [data-v]');
      if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); featGo(li); }
    });
  }
  window.addEventListener('resize', function () { if (area) syncPage(); });

  /* ------------------------------------------------ sliding the day line.
     Drag the line (on the map or the docked copy), or use the arrow keys on
     its label, to see the study on another day. A home screen or the
     Resources page redraws for that day (smart animate carries what stays);
     any other screen stays as it is and only the line moves */
  function dayAt(x) {
    var cols = document.querySelectorAll('.jr > .jr-cycle'), grid = document.querySelector('.jr');
    if (!grid || cols.length < 6) return null;
    var g = grid.getBoundingClientRect(), r = [].map.call(cols, function (c) { var b = c.getBoundingClientRect(); return [b.left - g.left, b.width]; });
    var from = [1, 2, 9, 30, 60, 90, 91, 181, 361], len = [0, 6, 20, 29, 29, 0, 89, 179, 359];
    var n = Math.min(r.length, LAST_DAY > 90 ? 9 : 6);
    if (x < r[0][0] + r[0][1]) return 1;
    for (var k = 1; k < n; k++) {
      if (x < r[k][0]) return from[k];
      if (x < r[k][0] + r[k][1]) return Math.round(from[k] + len[k] * (x - r[k][0]) / r[k][1]);
    }
    return n > 6 ? LAST_DAY : 90;
  }
  /* the screen for that day, if this screen has one */
  function dayScreen(day) {
    if (!cur) return null;
    if (/^res-hub/.test(cur)) {
      var rd = 'res-hub@' + day;
      if (!UI2[rd]) UI2[rd] = resPage('', '', day);
      return rd;
    }
    if ((isHome(cur) || /^home@/.test(cur)) && window.homeAt) return window.homeAt(day);
    /* v04 (29.OCT.2026): the Roadmap follows the day slider too */
    if (/^(1A|6A)(@|$)/.test(cur) && typeof monthView === 'function') {
      var mk = '1A@' + day;
      if (!UI2[mk]) UI2[mk] = monthView(day);
      return mk;
    }
    if (window.pageAt) { var pd = window.pageAt(cur, day); if (pd !== cur) return pd; }
    return null;
  }
  function scrubTo(day) {
    if (!area || !day || day === shownDay()) return;
    scrub = { day: day, at: here() };
    var to = dayScreen(day);
    if (to && to !== cur) { closeOverlay(); inPlace = true; render(to); }
    syncPage();
    publishFeedbackScreen();
  }
  var dragging = false, dragged = false;
  function onDrag(e) {
    var grid = document.querySelector('.jr');
    if (!dragging || !grid) return;
    dragged = true;
    scrubTo(dayAt(e.clientX - grid.getBoundingClientRect().left));
  }
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    document.documentElement.classList.remove('is-scrubbing');
    window.removeEventListener('pointermove', onDrag);
    /* the click that ends a drag doesn't also open or close the map */
    setTimeout(function () { dragged = false; }, 0);
  }
  document.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.jr-now, .jr-dock__now') || !area) return;
    e.preventDefault();
    dragging = true; dragged = false;
    document.documentElement.classList.add('is-scrubbing');
    window.addEventListener('pointermove', onDrag);
    window.addEventListener('pointerup', endDrag, { once: true });
    window.addEventListener('pointercancel', endDrag, { once: true });
  });
  document.addEventListener('click', function (e) {
    if (dragged || e.target.closest('.jr-now')) { e.stopPropagation(); e.preventDefault(); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!e.target.closest || !e.target.closest('.jr-now span')) return;
    var step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 7, PageDown: -7 }[e.key];
    var day = e.key === 'Home' ? 1 : e.key === 'End' ? LAST_DAY : step ? Math.max(1, Math.min(LAST_DAY, shownDay() + step * (e.shiftKey ? 7 : 1))) : null;
    if (day === null) return;
    e.preventDefault(); e.stopPropagation();
    scrubTo(day);
  }, true);

  /* a click on the timeline (the open map's stages and days, or the docked
     copy) goes to that day: the last moment by then, its home screen drawn
     for that exact day, so a click along the line shows the app changing */
  var dayOfStep = function (st) {
    var sc = (JR_SCENES[st.a.n] || {})[st.id], t = sc ? sc[0] : '';
    var d = /Day (\d+)/.exec(t), w = /Week (\d+)/.exec(t);
    return d ? +d[1] : w ? +w[1] * 7 - 6 : ({ 1: 1, 2: 6, 3: 16, 4: 48 })[st.a.n];
  };
  function toDay(day) {
    if (!area || !day) return;
    /* the last home moment on or before that day, else the last moment */
    var by = MAIN.filter(function (s) { return dayOfStep(s) <= day; });
    var to = by.filter(function (s) { return isHome(s.id); }).pop() || by.pop() || MAIN[0];
    if (to !== here()) jump(to);
    scrubTo(day);
    /* a home at that moment's own day already shows it */
    if (!dayScreen(day) && window.homeAt) { closeOverlay(); render(window.homeAt(day)); }
  }
  document.addEventListener('click', function (e) {
    if (dragged || !e.target.closest) return;
    var grid = document.querySelector('.jr'), link = document.querySelector('.jr-link');
    /* short, any click on the map is a day; open, a click on a stage or day */
    var onMap = grid && e.target.closest('.jr') && !e.target.closest('.jr-mark__btn, .jr-now') &&
      (link.classList.contains('is-short') || e.target.closest('.jr-stage, .jr-cycle'));
    var onDock = dock && dock.classList.contains('is-on') && e.target.closest('.jr-dock') && !e.target.closest('.jr-dock__now');
    if (!onMap && !onDock) return;
    toDay(dayAt(e.clientX - grid.getBoundingClientRect().left));
  });

  /* ------------------------------------------------- where you are (v03).
     The left panel shows the app's structure, so Prolaio sees at a glance
     where this screen sits: outside the app, onboarding, the Home and
     Resources tabs, the top bar. It follows the screen actually showing,
     sheets included: open Earnings from Home and Your participation lights, under
     Resources. Replaces the scene and the insight in v03 */
  /* a sitemap: [id, label, how its children sit ('flow' a sequence with
     arrows, 'row' side by side, else a branch each), children]. Sections
     are labels; screens are boxes */
  var WHERE = ['app', 'Prolaio app', '', [
    ['onb', 'Onboarding', 'flow', [['welcome', 'Welcome'], ['month1', 'First month'], ['setup', 'Setup']]],
    /* v04 (30.OCT.2026): the Today tab; the roadmap is a toggle on Today */
    ['home', 'Today tab', '', [
      ['today', 'Today', 'row', [['reading', 'Readings'], ['questionnaire', 'Questionnaire'], ['renewal', 'Study updates']]],
      ['month', 'Roadmap']]],
    ['resources', 'Library tab', 'row', [['data', 'Your data'], ['rewards', 'Your participation'], ['reports', 'Reports'],
      ['study', 'The study']]],
    ['topbar', 'Top bar', 'row', [['help', 'Help'], ['notifs', 'Notifications'], ['settings', 'Settings']]],
  ]];
  var WHERE_SECTIONS = ['app', 'onb', 'home', 'resources', 'topbar'];
  /* screen id to its place; the first rule that matches wins */
  var WHERE_RULES = [
    [/^(welcome|ac-)/, 'welcome'], [/^2A$/, 'month1'], [/^(1B|8A|3D|cn-)/, 'setup'],
    /* no lock screen: the study phone opens straight into the app; the
       notifications that needed one are BYOD designs, outside the flow */
    [/^(ck-|al-|home@|trivia@)|^(v2-3-streak|v2-3-poll|9D)$/, 'today'],
    [/^(6A|1A)/, 'month'],
    [/^(10B|10C|5B|rd|ins\.)/, 'reading'], [/^(4D|q[1-4]$|q-done|12A)/, 'questionnaire'], [/^rn/, 'renewal'],
    [/^res-hub/, 'resources'],
    [/^(v2-3-dash|v2-3-tally|11A|1D)/, 'data'],
    [/^tr-/, 'today'],
    [/^(16A|v2-3-streak-full|v2-3-trivia|v2-3-badges)/, 'rewards'],
    [/^(15D|14A)$/, 'reports'],
    [/^(19B|v2-3-community|v2-4-impact|v2-4-share-study|v2-4-region)$/, 'study'],
    /* no Status box (28.OCT): the status screen sits with Your data */
    [/^7A(@|$)/, 'data'], [/^(tm-thread|tm-new)$/, 'help'],
    /* scenarios (22.OCT): home moments sit on Today, fixes under Help,
       consent and the phone at a year with renewal, BYOD by where it happens */
    [/^sc-/, 'today'], [/^ts-/, 'help'], [/^(rc-|yr$)/, 'renewal'],
    [/^byod-4$/, 'today'], [/^byod-5$/, 'settings'],
  ];
  var RES_NODES = ['resources', 'data', 'rewards', 'reports', 'study'];
  function whereOf() {
    var ph = $('pt-phone'), ov = ph.querySelector('.j-ov:not(.is-out)');
    if (ov) {
      if (ov.querySelector('.j-drawer')) return 'today';
      var k = ((ov.querySelector('.j-sh__k') || {}).textContent || '').trim();
      if (/^(Help|Study team)/.test(k)) return 'help';
      if (/^Notifications/.test(k)) return 'notifs';
      if (/^Settings/.test(k)) return 'settings';
    }
    var c = cur || '', id = c.replace(/^res\./, ''), n = null;
    for (var r = 0; r < WHERE_RULES.length && !n; r++) if (WHERE_RULES[r][0].test(id)) n = WHERE_RULES[r][1];
    /* a screen opened from Resources sits under Resources */
    if (/^res\./.test(c) && n && RES_NODES.indexOf(n) < 0) n = 'resources';
    /* the tab that is lit has the last word: the same screen can open from
       Home (7A on day 2, the first-week recap, the streak) or as its copy
       under Resources, and the chart follows where it actually is */
    var tabs = [].slice.call(ph.querySelectorAll('.j-tabs > span')), t = tabs.findIndex(function (x) { return x.classList.contains('is-on'); });
    if (t === 0 && n && RES_NODES.indexOf(n) >= 0) n = 'today';
    if (t === 1 && n && RES_NODES.indexOf(n) < 0) n = 'resources';
    return n;
  }
  var whereBox = null, whereNow;
  function buildWhere() {
    var node = function (nd) {
      var sec = WHERE_SECTIONS.indexOf(nd[0]) >= 0 && nd[0] !== 'resources';
      var go = nd[0] !== 'app' ? ' role="button" tabindex="0" title="Go to ' + esc(nd[1]) + '"' : '';
      return '<li data-n="' + nd[0] + '"><span class="tw-n' + (sec ? ' tw-sec' : '') + (go ? ' tw-go' : '') + '"' + go + '>' + esc(nd[1]) + '</span>' +
        (nd[3] ? '<ul class="' + (nd[2] ? 'tw-' + nd[2] : 'tw-br') + '">' + nd[3].map(node).join('') + '</ul>' : '') + '</li>';
    };
    whereBox = document.createElement('div');
    whereBox.className = 'pt__where'; whereBox.id = 'pt-where';
    whereBox.setAttribute('aria-label', 'Where this screen is in the app');
    whereBox.innerHTML = '<p class="pt__where-k">Where you are in the app</p><ul class="tw">' + node(WHERE) + '</ul>';
    $('pt-when').after(whereBox);
    /* What we heard follows the map, at the foot of the column */
    var hd = dlg.querySelector('.pt__heard');
    if (hd) whereBox.after(hd);
    whereBox.addEventListener('click', function (e) {
      var s = e.target.closest('.tw-go');
      if (s) whereGo(s.parentElement.getAttribute('data-n'));
    });
    whereBox.addEventListener('keydown', function (e) {
      var s = e.target.closest('.tw-go');
      if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); whereGo(s.parentElement.getAttribute('data-n')); }
    });
  }
  /* a label takes you there: the top bar's sheets and This month open in
     place (they have no moment of their own); anything else jumps to the
     nearest main-line moment that sits there, or under it for a section */
  var WHERE_IN_PLACE = { topbar: 'help3', help: 'help3', notifs: 'notifs3', settings: 'settings3' };
  /* a place's own screens; Onboarding is any of its steps, the Home tab is Today */
  function whereIds(n) {
    if (n === 'home') return ['today'];
    if (n !== 'onb') return [n];
    var ids = [], walk = function (nd, inside) {
      inside = inside || nd[0] === n;
      if (inside) ids.push(nd[0]);
      (nd[3] || []).forEach(function (c) { walk(c, inside); });
    };
    walk(WHERE);
    return ids;
  }
  function whereGo(n) {
    if (WHERE_IN_PLACE[n]) { openOverlay(WHERE_IN_PLACE[n]); return; }
    var at = function (id) {
      for (var r = 0; r < WHERE_RULES.length; r++) if (WHERE_RULES[r][0].test(id)) return WHERE_RULES[r][1];
      return null;
    };
    /* the day on show stays: Today is that day's home, This week and This
       month are drawn for it, and any other place opens at the moment
       nearest that day */
    var day = shownDay();
    if (n === 'today' || n === 'home') { closeOverlay(function () { toDay(day); }); return; }
    if (n === 'month' || n === 'week') { closeOverlay(function () { if (n === 'month') tabTo(2); else goTo('6A'); }); return; }
    /* the Resources tab and its pages open as they are on this day, as a
       tap on the tab would; a page not open yet falls back to its moment */
    if (n === 'resources') { closeOverlay(function () { goTo('res-hub'); }); return; }
    var resRow = function () {
      var row = null;
      if (RES_NODES.indexOf(n) >= 0 && typeof RES_GROUPS !== 'undefined') RES_GROUPS.forEach(function (g) { g[1].forEach(function (r) {
        if (!row && r[4] <= shownDay() && /^res\./.test(r[3]) && at(r[3].slice(4)) === n) row = r;
      }); });
      return row;
    };
    var row = resRow();
    if (row) { closeOverlay(function () { goTo(row[3]); }); return; }
    /* its moments, nearest first; the first that really shows it there
       wins (a page can sit under Home on one day, under Resources later) */
    var ids = whereIds(n), ok = function () { return ids.indexOf(whereOf()) >= 0; };
    var near = MAIN.map(function (s, m) { return [s, m, Math.abs(dayOfStep(s) - day)]; })
      .filter(function (x) { return ids.indexOf(at(x[0].id)) >= 0; })
      .sort(function (a, b) { return a[2] - b[2] || a[1] - b[1]; });
    /* a reading, a questionnaire or the renewal can come up on any day: it
       opens on the day on show, not at its own moment's day */
    /* 30.OCT.2026: and always at its start, the same on every day (a
       reading at the cuff, the questionnaire's first screen, the renewal's
       question), opened from that day's Today, so its back and Done come
       back to that day */
    var START = { reading: '5B', questionnaire: '4D', renewal: 'rn' };
    if (START[n] && UI2[START[n]]) {
      closeOverlay(function () { toDay(day); tap('view:' + START[n]); });
      return;
    }
    if (/^(reading|questionnaire|renewal)$/.test(n) && near.length) {
      var sid = near[0][0].id;
      closeOverlay(function () { toDay(day); render(sid); });
      return;
    }
    for (var k = 0; k < near.length; k++) {
      jump(near[k][0]);
      if (ok()) return;
      /* by that day its page may be under Resources */
      if ((row = resRow())) { goTo(row[3]); if (ok()) return; }
    }
    if (near.length) jump(near[0][0]);
  }
  function showWhere() {
    if (!whereBox) buildWhere();
    var n = whereOf();
    if (n === whereNow) return;
    whereNow = n;
    whereBox.querySelectorAll('li').forEach(function (li) { li.classList.remove('is-on', 'is-path'); });
    var on = n && whereBox.querySelector('li[data-n="' + n + '"]');
    if (!on) return;
    on.classList.add('is-on');
    for (var p = on.parentElement.closest('li'); p; p = p.parentElement.closest('li')) p.classList.add('is-path');
  }
  var whereQueued = false;
  new MutationObserver(function () {
    if (whereQueued) return;
    whereQueued = true;
    setTimeout(function () { whereQueued = false; showWhere(); }, 0);
  }).observe($('pt-phone'), { childList: true, subtree: true });

  /* ---------------------------------------------------- docked timeline.
     Past the journey map, a slim copy of it docks under the site's top bar
     over the prototype: the stages, the day columns, lined up with the map,
     and the same moving day marker, so the timeline and the phone share one
     screen. It fades in and out; nothing on the page moves */
  var DOCK_TOP = 64, DOCK_H = 56, dock = null;
  function buildDock() {
    var grid = document.querySelector('.jr');
    if (!grid || !grid.offsetParent) { if (dock) dock.hidden = true; return; }
    if (!dock) {
      dock = document.createElement('div');
      dock.className = 'jr-dock'; dock.setAttribute('aria-hidden', 'true');
      document.body.appendChild(dock);
    }
    var g = grid.getBoundingClientRect();
    dock.style.left = g.left + 'px'; dock.style.width = g.width + 'px';
    var at = function (el) { var r = el.getBoundingClientRect(); return 'left:' + (r.left - g.left) + 'px;width:' + r.width + 'px'; };
    dock.innerHTML =
      [].map.call(grid.querySelectorAll(':scope > .jr-stage'), function (st) {
        return '<span class="jr-dock__st' + (st.classList.contains('jr-rep') ? ' is-rep' : '') + '" style="' + at(st) + '">' + st.innerHTML + '</span>';
      }).join('') +
      [].map.call(grid.querySelectorAll(':scope > .jr-cycle'), function (c) {
        return '<span class="jr-dock__d" style="' + at(c) + '">' + esc(c.textContent) + '</span>';
      }).join('') +
      '<i class="jr-dock__now"><span></span></i>';
    dockMarker();
    placeDock();
  }
  function dockMarker() {
    if (!dock || !area) return;
    var x = dayX(shownDay()), m = dock.querySelector('.jr-dock__now');
    if (!m) return;
    m.hidden = x === null;
    if (x !== null) { m.style.left = x + 'px'; m.querySelector('span').textContent = 'Day ' + shownDay(); }
  }
  /* shown once the map's stages and day columns (what the dock repeats)
     have scrolled under the top bar, while the prototype is still on screen */
  function placeDock() {
    if (!dock) return;
    var day = document.querySelector('.jr > .jr-cycle'), d = dlg.getBoundingClientRect();
    var on = !!day && !!day.offsetParent && day.getBoundingClientRect().bottom < DOCK_TOP + 4 && d.bottom > DOCK_TOP + DOCK_H + 120;
    dock.classList.toggle('is-on', on);
  }
  window.addEventListener('scroll', placeDock, { passive: true });
  /* the map changed height (short or full): the day line, dock and wires follow */
  window.jrRelayout = function () { if (area) syncPage(); buildDock(); };
  window.addEventListener('resize', buildDock);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildDock);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (area) syncPage(); });

  /* the prototype on the page: under the journey, open at the start */
  if (INLINE) {
    var link = document.querySelector('.jr-link');
    if (link) link.after(dlg);
    dlg.classList.add('pt--inline');
    /* the toggles head the right column, on the same top edge as the
       eyebrow, clear of the site's floating feedback button */
    var tools = dlg.querySelector('.pt__tools'), rightCol = dlg.querySelector('.pt__right');
    if (tools && rightCol) rightCol.prepend(tools);
    /* the journey bar (moment n of 28 and its dots) sits between Earlier
       and Later under the phone, in place of the arrows */
    $('pt-sprev').after($('pt-map'));
    /* Archived designs (22.OCT.2026): screens out of the current flow, kept to
       look at under the prototype, closed by default. Each row is one design
       at its states, drawn in the Prolaio theme like the phone above */
    /* a closed section under the prototype: each row is one design at its
       states, drawn in the Prolaio theme on first open */
    /* a section's screens open large on a click (30.OCT.2026), with the
       one before and after a tap or an arrow key away; Esc or a click
       outside closes it */
    var archZoom = function (sec, fig) {
      var figs = [].slice.call(sec.querySelectorAll('.jr-arch__f')), k = figs.indexOf(fig);
      var box = document.createElement('div');
      box.className = 'jr-zoom'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<button class="jr-zoom__x" aria-label="Close">✕</button>' +
        '<button class="jr-zoom__nav jr-zoom__prev" aria-label="Previous screen">‹</button>' +
        '<div class="jr-zoom__st"><div class="jr-zoom__ph"></div><p class="jr-zoom__cap"></p></div>' +
        '<button class="jr-zoom__nav jr-zoom__next" aria-label="Next screen">›</button>';
      var show = function (n) {
        k = (n + figs.length) % figs.length;
        var f = figs[k], tw = f.querySelector('.jr-arch__tw').cloneNode(true), ph = box.querySelector('.jr-zoom__ph');
        ph.innerHTML = ''; ph.appendChild(tw);
        var row = f.closest('.jr-arch__row'), t = row && row.querySelector('.jr-arch__t b');
        box.querySelector('.jr-zoom__cap').innerHTML = '<b>' + esc(f.querySelector('figcaption').textContent) + '</b>' +
          (t ? '<span>' + esc(t.textContent) + '</span>' : '') + '<em>' + (k + 1) + ' of ' + figs.length + '</em>';
        /* as large as the window allows */
        var inner = tw.querySelector('.td-ph');
        inner.style.zoom = 1;
        var z = Math.min((innerHeight - 120) / inner.offsetHeight, (innerWidth - 160) / inner.offsetWidth, 2.2);
        inner.style.zoom = Math.max(1, z);
      };
      var fit = function () { show(k); };
      var close = function () { box.remove(); document.removeEventListener('keydown', key, true); removeEventListener('resize', fit); fig.focus && fig.focus(); };
      var key = function (e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(k - 1);
        else if (e.key === 'ArrowRight') show(k + 1);
        else return;
        e.preventDefault(); e.stopPropagation();
      };
      box.addEventListener('click', function (e) {
        if (e.target.closest('.jr-zoom__prev')) show(k - 1);
        else if (e.target.closest('.jr-zoom__next')) show(k + 1);
        else if (e.target.closest('.jr-zoom__x') || !e.target.closest('.jr-zoom__ph')) close();
      });
      document.addEventListener('keydown', key, true);
      addEventListener('resize', fit);
      document.body.appendChild(box);
      box.querySelector('.jr-zoom__nav').hidden = box.querySelector('.jr-zoom__next').hidden = figs.length < 2;
      show(k);
    };
    var archSection = function (title, sub, rowsA, after, cls) {
      var arch = document.createElement('details');
      arch.className = 'jr-arch' + (cls ? ' ' + cls : '');
      arch.innerHTML = '<summary><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></summary><div class="jr-arch__rows">' +
        rowsA.map(function (r) {
          return '<div class="jr-arch__row" style="--n:' + r[2].length + '"><p class="jr-arch__t"><b>' + esc(r[0]) + '</b>' + esc(r[1]) + '</p><div class="jr-arch__g">' +
            r[2].map(function (st) {
              return '<figure class="jr-arch__f"><div class="td-twin pr jr-arch__tw"><div class="cn-ph pt__phone td-ph" aria-hidden="true">' + st[1] + '</div></div><figcaption>' + esc(st[0]) + '</figcaption></figure>';
            }).join('') + '</div></div>';
        }).join('') + '</div>';
      after.after(arch);
      var drawArch = function () {
        if (arch.getAttribute('data-drawn')) return;
        arch.setAttribute('data-drawn', '1');
        arch.querySelectorAll('.td-ph').forEach(function (ph) {
          ph.querySelectorAll('[data-enter]').forEach(function (e) { e.removeAttribute('data-enter'); });
          /* plain screens: no coach marks or dimming from the highlights mode */
          ph.querySelectorAll('.j-spot__tip').forEach(function (e) { e.remove(); });
          ph.querySelectorAll('.is-spotlit').forEach(function (e) { e.classList.remove('is-spotlit'); });
          if (window.prTransform) window.prTransform(ph);
        });
      };
      arch.addEventListener('toggle', function () { if (arch.open) drawArch(); });
      arch.querySelectorAll('.jr-arch__f').forEach(function (f) { f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Zoom in: ' + f.querySelector('figcaption').textContent); });
      arch.addEventListener('click', function (e) { var f = e.target.closest('.jr-arch__f'); if (f) archZoom(arch, f); });
      arch.addEventListener('keydown', function (e) { var f = e.target.closest && e.target.closest('.jr-arch__f'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); archZoom(arch, f); } });
      return arch;
    };
    var lastSec = dlg;
    /* BYOD designs (23.OCT.2026): what changes when a participant takes part
       on their own phone, not the study phone. Moved here out of the flow;
       their moment notes and quotes stay in JR_SCENES and JR_NOTES */
    var byod = [
      /* v04 (28.OCT.2026): check-ins, out of the main flow; '@' takes its
         states from UI2X (the sheet, the phone's prompt, the outcome) */
      ['Check-ins on your own phone', 'Reminders at the moments that matter, mostly in week one; the phone asks before any are sent.', '@byod.checkins'],
      ['When the phone closes the app', 'Readings wait to send; one battery setting stops it happening again.', 'byod-4', 'Readings are waiting'],
      ['Reminders on your own phone', 'An evening notification opens the app straight at the cuff.', 'bp-lock', 'Evening reminder'],
      ['When data stops coming in', 'The study team reaches out after two days without bracelet data.', 'tm-lock', 'Study team message'],
      ['Moving to a new phone', 'Sign in with the study code; the devices reconnect on their own.', 'byod-5', 'New phone'],
    ].filter(function (r) { return r[2][0] === '@' ? typeof UI2X !== 'undefined' && UI2X[r[2].slice(1)] : typeof UI2 !== 'undefined' && UI2[r[2]]; });
    /* v04 (30.OCT.2026): errors and alerts, out of the flow and side by
       side, first under the prototype (above FDA): the bracelet's banners, then the ways a reading
       fails, each state its own phone at the section's size */
    var errRows = [
      ['Reading errors', 'What happened and the one thing to do, Try again first.', 'rd-errs'],
      ['Scale error', 'The weight didn’t reach the phone: step off, wait, step on again.', 'rd-errs'],
      ['Bracelet alerts', 'Amber can wait; red means data is being missed.', 'al-errs'],
    ].filter(function (r) { return typeof UI2 !== 'undefined' && JR_COMPARE[r[2]]; });
    /* a row holds four phones at most, so the scale's error has its own;
       readings first, then the scale, then the bracelet (4, then 1 + 3),
       and the study team sheet left out */
    if (errRows.length) lastSec = archSection('Errors and alerts', 'When a device or a reading needs you', errRows.map(function (r) {
      var states = JR_COMPARE[r[2]].filter(function (c) { return UI2[c[0]] && c[0] !== 'al-team' && (r[2] !== 'rd-errs' || (c[0] === 'rd-err-sc') === (r[0] === 'Scale error')); })
        .map(function (c) { return [c[1], UI2[c[0]]]; });
      if (r[0] === 'Reading errors' && UI2['rd-err']) states.unshift(['Cuff too loose', UI2['rd-err']]);
      return [r[0], r[1], states];
    }), lastSec, 'jr-arch--side');
    /* FDA emphasized designs (27.OCT.2026): the clinical value made visible,
       and trends at the level wellness apps set. Under Errors and alerts;
       Archived designs moved to the bottom. In every section the designs run
       in the app's order: onboarding, Home, Resources, then the top bar */
    if (typeof UI2X !== 'undefined' && UI2X['fd.trend']) {
      lastSec = archSection('FDA emphasized designs', 'Clinical value made visible, with the charts people expect', [
        ['FDA cleared, said up front', 'The welcome names the devices and app as medical grade, before setup begins.', UI2X['fd.welcome']],
        ['When a study keeps readings hidden', 'A reason instead of a blank, proof the devices are recording, and everything once the study ends.', UI2X['fd.hidden']],
        ['Trend screens people expect', 'Real charts with axes and ranges, your usual range shaded, missed days marked, and low, average and high.', UI2X['fd.trend']],
        ['A report your doctor can use', 'The study cardiologist reviews it; you share it with your own doctor as a link that expires, a PDF or on paper.', UI2X['fd.report']],
      ], lastSec, 'jr-arch--side');
    }
    if (byod.length) lastSec = archSection('BYOD designs', 'Taking part on your own phone', byod.map(function (r) {
      return [r[0], r[1], r[2][0] === '@' ? UI2X[r[2].slice(1)] : [[r[3], UI2[r[2]]]]];
    }), lastSec, 'jr-arch--side');
    if (typeof UI2X !== 'undefined' && UI2X['arch.band']) {
      archSection('Archived designs', 'Not in the current flow, kept for later', [
        ['Connecting a device during setup, by distance', 'The bracelet step showed how close your phone was, until it connected.', UI2X['arch.band']],
        ['Connecting the scale, by distance', 'A meter from far to close, with how far away your phone was.', UI2X['arch.scale']],
      ], lastSec);
    }
    /* v03 (22.OCT.2026): the moment's one-line note sits under its title, and
       a "What we heard" button opens the R1 interview evidence for the
       screens that have some. The two keep a fixed height, so the left
       column below never moves */
    var heard = document.createElement('div');
    heard.className = 'pt__heard';
    heard.innerHTML = '<button type="button" class="pt__heard-b" id="pt-heard-b" aria-expanded="false" aria-controls="pt-heard-p">What we heard in interviews <span id="pt-heard-n"></span></button>' +
      '<div class="pt__heard-p" id="pt-heard-p" hidden></div>';
    $('pt-title').after($('pt-scene'));
    /* v03 (23.OCT.2026): the button sits at the foot of the left column, so
       the app map and the feature list start higher, level with each other */
    if ($('pt-where')) $('pt-where').after(heard); else $('pt-scene').after(heard);
    heard.classList.add('pt__heard--foot');
    $('pt-heard-p').appendChild($('pt-notes'));
    var heardOpen = function (on) {
      $('pt-heard-p').hidden = !on;
      $('pt-heard-b').setAttribute('aria-expanded', String(on));
    };
    $('pt-heard-b').addEventListener('click', function (e) { e.stopPropagation(); heardOpen($('pt-heard-p').hidden); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.pt__heard')) heardOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') heardOpen(false); });
    window.ptHeard = function (n) {
      heardOpen(false);
      $('pt-heard-n').textContent = n || '';
      heard.classList.toggle('is-none', !n);
    };
    /* above the phone: a day back or ahead at this moment, which moves the
       timeline's day line with it */
    var days = document.createElement('div');
    days.className = 'pt__days'; days.setAttribute('role', 'group'); days.setAttribute('aria-label', 'Study day');
    var chv = function (d) { return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5') + '"/></svg>'; };
    days.innerHTML = '<button type="button" class="pt__day" data-d="-1" aria-label="Day before" title="Day before">' + chv(-1) + '</button>' +
      '<b id="pt-day"></b><button type="button" class="pt__day" data-d="1" aria-label="Day after" title="Day after">' + chv(1) + '</button>';
    dlg.querySelector('.pt__stage').prepend(days);
    days.addEventListener('click', function (e) {
      var b = e.target.closest('[data-d]');
      if (b && !b.disabled) scrubTo(Math.max(1, Math.min(LAST_DAY, shownDay() + +b.getAttribute('data-d'))));
    });
    /* read before opening: opening keeps its own first screen */
    var kept = null;
    try { kept = JSON.parse(sessionStorage.getItem(KEEP) || 'null'); } catch (e) {}
    open(1, true);
    if (kept && kept.s) document.dispatchEvent(new CustomEvent('pr-feedback-open-screen', { detail: { screen: kept.s } }));
    /* the page scrolls back as it grows tall enough (its images and fonts
       still coming in), unless you scroll first */
    if (kept && kept.y) {
      restoring = true;
      var tries = 0, back = function () {
        if (!restoring) return;
        window.scrollTo(0, kept.y);
        if (Math.abs(window.scrollY - kept.y) > 2 && ++tries < 30) setTimeout(back, 100); else restoring = false;
      };
      ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, function () { restoring = false; }, { once: true, passive: true }); });
      requestAnimationFrame(back);
    }
  }

  dlg.addEventListener('keydown', function (e) {
    if (e.target.closest('.pr-feedback-root, .pr-feedback-pins')) return;
    /* with a sheet open, the arrows don't move the screen behind it */
    if (sheetOpen()) return;
    if (e.key === 'ArrowRight') nextClick();
    if (e.key === 'ArrowLeft') prevClick();
  });
})();

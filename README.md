# anon qa app
![](https://hackatime-badge.hackclub.com/U087ATD163V/anon-ngl-app)

A free and self hostable alternative to `ngl.link`, with no paid subscription, just a simple app that you and your friends can share to manage their QAs (also team support is coming soon!).

The prod service is hosted on Vercel and Convex's Public Cloud infra. https://anonqa.pleaseuse.me

## Safety!
For exploits on the platform, please DO NOT USE ISSUES EVEN FOR EXISTING ISSUES, JUST DO NOT USE THEM, please contact: anonqa-exploits@yhw.tw with the starting title of `[EXPLOIT]`, so I can make them easier to publish in a report.

Other than the email, you can also contact me on discord `hwtw` (you can maybe dm me?). If you are in the HC slack, please contact me there instead. All lines will be faster then contacting via emails (as I will get a jumpscare when I get messages from one of these platforms).

## What is made by AI?
Most of the code is writen by myself. However, I sometimes do ask an AI (Claude Sonnet 3.5 or Grok Code Fast 1) or enable to AI auto compelete functions from Zed.

The code fully writien by AI is the ~/web/manage/[team]/answer/[slug]/canvasText.tsx, canvasText component, as I'm incaptiable working with canvases.

The login/registering pages's base is writen by an AI, and changed by me (some styles and fonts) and the main function as well.

And some convex functions are assisted by the AI on convex's docs website! https://docs.convex.dev


## Designs
Figma!: https://www.figma.com/design/Rc1A45MnZTXP4Yi4yYyhFP/anon-qa-app-design?node-id=14-23&t=C91bU8Bd40tcVmDe-1

## How can I self host?
TBD

## What?

Where I live Taiwan, a lot of ppl use sites like `ngl.link` or `marshmellow` for their anon qa stuff, 2 years ago I tried doing this in linktree (for myself), but failed bacause of it's limited functionalty. Now I have learned some stacks, (the NTP stack (Nuxt, Tailwind, Postgres)), I will try to redo my attempts at doing so, with self hostable services (or something you can host it yourself on vercel or cloudflare).

## Features
- AI Message flagging
- Team Management.
- Customizable random messages
- Customizable Placeholders
- LIVE updates (from the dashboard)
- LIVE updates to the Teams page.

## Concerns & Problems
### Sending speeds
When Cloudflare Turnstil is on, the cloudflare turnstile function take a few seconds to verify the function, which is not ideal, so if you don't care about captchas, you can disable it. This will have two upsides.
1. A better UI experence to the user
2. The user submition is faster to submit.

### Selecting teams panel
This is only a UI issue. It does not affect the use of the dashboard. (yes im writing this like pretty late sooo i have no time to polish :\

### Mobile usage!
This app is not really designed for mobile users (but mobile devices are what most ppl will use to access the app)

## goals
ship and add error handling. the current systems does not error handle like at all and the settings page is still missing a few settings. like reseting passwords & delete team & login accounts.

## NOTES!
DO NOT USE THE NATIVE `<Link>` component, this componenet will PRELOAD the page (which if its a FUCKING LOGOUT ROUTE) it will break, (i spent too much time debugging this garbage)


# Credits!
Thanks to [lucide](https://lucide.dev) for all of the SVGs and Icons used for this project!

# anon qa app
![](https://hackatime-badge.hackclub.com/U087ATD163V/anon-ngl-app)

A free and self hostable alternative to `ngl.link`, with no paid subscription, just a simple app that you and your friends can share to manage their QAs (also team support is coming soon!).

The prod service is hosted on Vercel and Convex's Public Cloud infra. https://anonqa.pleaseuse.me

## Safety!
For exploits on the platform, please DO NOT USE ISSUES EVEN FOR EXISTING ISSUES, JUST DO NOT USE THEM, please contact: anonqa-exploits@yhw.tw with the starting title of `[EXPLOIT]`, so I can make them easier to publish in a report.

Other than the email, you can also contact me on discord `hwtw` (you can maybe dm me?). If you are in the HC slack, please contact me there instead. All lines will be faster then contacting via emails (as I will get a jumpscare when I get messages from one of these platforms).

## Design Files
after the figma removal of the education plan, I now use penpot. The designs are in /design/.

## What?

Where I live Taiwan, a lot of ppl use sites like `ngl.link` or `marshmellow` for their anon qa stuff, 2 years ago I tried doing this in linktree (for myself), but failed bacause of it's limited functionalty. Now I have learned some stacks, (the NTP stack (Nuxt, Tailwind, Postgres)), I will try to redo my attempts at doing so, with self hostable services (or something you can host it yourself on vercel or cloudflare).


## Concerns & Problems
### Sending speeds
When Cloudflare Turnstil is on, the cloudflare turnstile function take a few seconds to verify the function, which is not ideal, so if you don't care about captchas, you can disable it. This will have two upsides.
1. A better UI experence to the user
2. The user submition is faster to submit.


## PRIOTIZE!
1. the manage panel!
2. LOGIN SYSTEM (SUPER IMPORTANT!!!)
3. the safety system (done)
4. polish the UI

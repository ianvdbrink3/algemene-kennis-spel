# 003 — Simpel wachtwoord-auth boven magic-link

**Context:** Het originele plan gebruikte magic-link via Resend voor auth. App is voor één gebruiker (mezelf).

**Beslissing:** Env var wachtwoord (`ADMIN_PASSWORD`) + signed JWT cookie via `jose`. Geen externe auth-dienst, geen email-afhankelijkheid, geen Resend-account. Cookie is 90 dagen geldig — op telefoon hoef ik vrijwel nooit opnieuw in te loggen.

**Consequenties:** Geen self-service password reset (niet nodig voor solo use). Als de app later naar meer gebruikers gaat, is dit de eerste ting om te vervangen door NextAuth of Clerk.

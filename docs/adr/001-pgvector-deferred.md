# 001 — pgvector uitgesteld naar post-MVP

**Context:** Het originele plan bevatte vector embeddings per kaart (OpenAI text-embedding-3-small) in pgvector voor recommendation. Dit vereist OpenAI als extra externe dienst en complexiteit in de pipeline.

**Beslissing:** Geen vector embeddings in MVP. Recommendation werkt op basis van dwell_ms per domain/topic — eenvoudig te implementeren, geen extra kosten, werkt prima voor één gebruiker. pgvector wordt pas toegevoegd als de topic-gebaseerde aanpak te grof aanvoelt.

**Consequenties:** Eenvoudigere stack (geen OpenAI account), snellere MVP. Post-MVP: als "meer zoals dit" nodig is, kan pgvector alsnog worden toegevoegd als Neon extension met een schema-migratie.

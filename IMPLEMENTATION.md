# Autonoma integration

- [x] SDK endpoint at `/api/autonoma`
- [x] `PortfolioData` factory
- [x] `About` factory
- [x] `Project` factory
- [x] `MissionUpdate` factory
- [x] `Contact` factory
- [x] `Edumaxim` factory
- [x] Scoped, idempotent teardown
- [x] Auth callback with real application credentials
- [x] Agent maintenance note
- [x] Full-recipe endpoint lifecycle pass with direct store inspection
- [x] Concurrent-instances proof
- [x] Clean `sdk check` on the recipe file
- [x] Pushed branch and opened pull request ([#4](https://github.com/owner-scotthwcouk/owner-scotthwcouk.github.io/pull/4))

The application persists one JSON document per seeded `PortfolioData` root rather than using a relational database. The root file name is derived from `testRunId`; child singletons are unique within that root, while projects and mission updates use the application's `(stardate, title)` matching rules. There are no database indexes or time-dependent persisted fields to seed. Validation used process-local `AUTONOMA_SIGNING_SECRET`, `ADMIN_UN`, and `ADMIN_PW` values; deployment must provide those existing application settings without committing them.


## Neon CRUD update

The current implementation replaces filesystem storage with versioned Neon JSONB documents. Projects and mission updates now use stable IDs; test scope cookies are signed. See starship-portfolio/docs/NEON_SETUP.md and docs/AUTONOMA_RECIPE.md for the current setup and recipe. Earlier filesystem validation above is historical, not validation of this database implementation.

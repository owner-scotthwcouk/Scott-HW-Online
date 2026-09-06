# Autonoma CRUD recipe

Initialize the Neon schema with npm run db:init. Configure DATABASE_URL,
ADMIN_SESSION_SECRET, AUTONOMA_SHARED_SECRET, and AUTONOMA_SIGNING_SECRET.
The signed /api/autonoma endpoint uses the existing SDK factory protocol.

1. Create PortfolioData with a descriptive name (root ID: portfolio-<testRunId>).
2. Create About with portfolioDataId, title, image, bio, inspiration, closing.
3. Create Project with portfolioDataId, stardate, title, desc, url.
4. Create MissionUpdate with portfolioDataId, stardate, update_title, update_desc.
5. Create Contact with portfolioDataId, email, github, linkedin.
6. Optionally create Edumaxim using its existing schema.
7. Apply the signed autonoma-portfolio cookie returned by auth; sign in using the
   returned credentials. Never construct an unsigned scope cookie.
8. Check the public sections. In admin, create a project and mission, edit their
   titles, reload, and verify each still exists exactly once with its original ID.
9. Update contact, reload, verify public content. Delete both records and verify
   they remain absent after reload. Check stale-version saves return 409.
10. Logout and verify PUT /api/data is denied. Teardown PortfolioData; only that
    test document is removed. Production content must remain unchanged.

Project and MissionUpdate factories now return the generated stable record ID.
They call the same save functions used by the admin. All factories persist through
Neon; no local filesystem persistence remains. Parallel child updates retry version
conflicts. Empty roots provide blank valid Contact/About fields. The checked-in autonoma-recipe.json mirrors the current live standard recipe; its input schema remains compatible.

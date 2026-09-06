# Repository guidance

## Autonoma test data

Autonoma seeds realistic end-to-end test data through the signed `/api/autonoma` endpoint and its factories, using the portfolio application's own data-creation functions. Whenever a model or its creation code changes, add or update the matching factory and keep the Autonoma recipe in sync.

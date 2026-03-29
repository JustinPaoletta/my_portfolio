#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v1.58.2-noble"
NODE_MODULES_VOLUME="my_portfolio_visual_node_modules"

docker run --rm \
  -v "${ROOT_DIR}:/work" \
  -v "${NODE_MODULES_VOLUME}:/work/node_modules" \
  -w /work \
  -e CI=true \
  -e VITE_APP_TITLE='Portfolio' \
  -e VITE_APP_DESCRIPTION='Portfolio website' \
  -e VITE_API_URL='https://api.example.com' \
  -e VITE_SITE_URL='' \
  -e VITE_ENABLE_ANALYTICS='false' \
  -e VITE_ENABLE_DEBUG='false' \
  -e VITE_ENABLE_ERROR_MONITORING='false' \
  -e VITE_GITHUB_URL='https://github.com/example' \
  -e VITE_LINKEDIN_URL='https://linkedin.com/in/example' \
  -e VITE_EMAIL='example@example.com' \
  -e VITE_UMAMI_WEBSITE_ID='' \
  -e VITE_GOOGLE_ANALYTICS_ID='' \
  -e VITE_NEWRELIC_LICENSE_KEY='' \
  -e VITE_NEWRELIC_ACCOUNT_ID='' \
  -e VITE_NEWRELIC_TRUST_KEY='' \
  -e VITE_NEWRELIC_AGENT_ID='' \
  -e VITE_NEWRELIC_APPLICATION_ID='' \
  -e VITE_MAPBOX_TOKEN='' \
  -e VITE_GITHUB_USERNAME='octocat' \
  -e VITE_GITHUB_API_ENABLED='true' \
  "${PLAYWRIGHT_IMAGE}" \
  /bin/bash -lc "npm ci && npx playwright test --project=visual-chromium --grep @visual $*"

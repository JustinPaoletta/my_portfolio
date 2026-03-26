#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v1.58.2-noble"
NODE_MODULES_VOLUME="my_portfolio_visual_node_modules"

docker run --rm \
  -v "${ROOT_DIR}:/work" \
  -v "${NODE_MODULES_VOLUME}:/work/node_modules" \
  -w /work \
  "${PLAYWRIGHT_IMAGE}" \
  /bin/bash -lc "npm ci && VITE_GITHUB_API_ENABLED=true npx playwright test --project=visual-chromium --grep @visual $*"

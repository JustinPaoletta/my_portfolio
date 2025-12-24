#!/bin/sh

# Ensure nvm is available for Husky hooks run by non-interactive shells.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  # Try project-specific version, then fallback to default without failing the hook.
  nvm use --silent >/dev/null 2>&1 || nvm use default --silent >/dev/null 2>&1 || true
fi

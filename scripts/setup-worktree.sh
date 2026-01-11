#!/bin/bash
# setup-worktree.sh
# Sets up symlinks for gitignored files in a new worktree
#
# Usage: ./scripts/setup-worktree.sh /path/to/worktree
#
# This script creates symlinks for:
#   - .env.local (environment variables)
#   - .vercel (Vercel project linking)
#
# These files are gitignored and don't automatically copy to worktrees.

set -e

# Get the main repo directory (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAIN_REPO="$(dirname "$SCRIPT_DIR")"

# Check if worktree path was provided
if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/worktree"
    echo ""
    echo "Example:"
    echo "  $0 ~/.cursor/worktrees/my_portfolio/feature-branch"
    exit 1
fi

WORKTREE_PATH="$1"

# Verify the worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
    echo "Error: Worktree directory does not exist: $WORKTREE_PATH"
    exit 1
fi

# Verify we're in the right repo by checking for a known file
if [ ! -f "$MAIN_REPO/package.json" ]; then
    echo "Error: Main repo not found at: $MAIN_REPO"
    exit 1
fi

echo "Setting up worktree: $WORKTREE_PATH"
echo "Main repo: $MAIN_REPO"
echo ""

# Setup .env.local symlink
if [ -f "$MAIN_REPO/.env.local" ]; then
    if [ -e "$WORKTREE_PATH/.env.local" ]; then
        rm -f "$WORKTREE_PATH/.env.local"
        echo "  Removed existing .env.local"
    fi
    ln -s "$MAIN_REPO/.env.local" "$WORKTREE_PATH/.env.local"
    echo "  ✅ Created symlink: .env.local"
else
    echo "  ⚠️  Skipped .env.local (not found in main repo)"
fi

# Setup .vercel symlink
if [ -d "$MAIN_REPO/.vercel" ]; then
    if [ -e "$WORKTREE_PATH/.vercel" ]; then
        rm -rf "$WORKTREE_PATH/.vercel"
        echo "  Removed existing .vercel"
    fi
    ln -s "$MAIN_REPO/.vercel" "$WORKTREE_PATH/.vercel"
    echo "  ✅ Created symlink: .vercel"
else
    echo "  ⚠️  Skipped .vercel (not found in main repo)"
fi

echo ""
echo "Done! Worktree is ready to use."
echo ""
echo "You can now run:"
echo "  cd $WORKTREE_PATH"
echo "  npm run start:vercel"

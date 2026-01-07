#!/bin/bash
#
# Setup script to install git hooks for Peekachoo
# Run this script after cloning the repository

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_SRC="$ROOT_DIR/hooks"
HOOKS_DEST="$ROOT_DIR/.git/hooks"

echo "Installing git hooks..."

# Check if hooks source directory exists
if [ ! -d "$HOOKS_SRC" ]; then
    echo "Error: hooks directory not found at $HOOKS_SRC"
    exit 1
fi

# Copy pre-push hook
if [ -f "$HOOKS_SRC/pre-push" ]; then
    cp "$HOOKS_SRC/pre-push" "$HOOKS_DEST/pre-push"
    chmod +x "$HOOKS_DEST/pre-push"
    echo "✓ Installed pre-push hook"
else
    echo "⚠ pre-push hook not found, skipping"
fi

echo ""
echo "Git hooks installed successfully!"
echo "The pre-push hook will run lint on all modules before each push."

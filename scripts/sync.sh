#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Syncing Peekachoo Repositories${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to generate commit message based on changes
generate_commit_message() {
    local path=$1
    local name=$2

    cd "$ROOT_DIR/$path" 2>/dev/null || cd "$ROOT_DIR" || return

    # Get list of changed files
    local added=$(git diff --cached --name-only --diff-filter=A 2>/dev/null | wc -l | tr -d ' ')
    local modified=$(git diff --cached --name-only --diff-filter=M 2>/dev/null | wc -l | tr -d ' ')
    local deleted=$(git diff --cached --name-only --diff-filter=D 2>/dev/null | wc -l | tr -d ' ')

    # Get the main files/directories changed
    local files_changed=$(git diff --cached --name-only 2>/dev/null | head -5)

    # Detect type of changes
    local msg_parts=()

    # Check for specific patterns in changed files
    if echo "$files_changed" | grep -q "scene"; then
        msg_parts+=("Update scenes")
    fi
    if echo "$files_changed" | grep -q "service"; then
        msg_parts+=("Update services")
    fi
    if echo "$files_changed" | grep -q "controller"; then
        msg_parts+=("Update controllers")
    fi
    if echo "$files_changed" | grep -q "style\|css\|responsive"; then
        msg_parts+=("Update styles")
    fi
    if echo "$files_changed" | grep -q "test"; then
        msg_parts+=("Update tests")
    fi
    if echo "$files_changed" | grep -q "config\|\.env"; then
        msg_parts+=("Update config")
    fi
    if echo "$files_changed" | grep -q "package.json"; then
        msg_parts+=("Update dependencies")
    fi
    if echo "$files_changed" | grep -q "README\|\.md"; then
        msg_parts+=("Update docs")
    fi
    if echo "$files_changed" | grep -q "script"; then
        msg_parts+=("Update scripts")
    fi

    # Build message
    local commit_msg=""
    if [ ${#msg_parts[@]} -gt 0 ]; then
        commit_msg=$(IFS=', '; echo "${msg_parts[*]}")
    else
        # Generic message based on counts
        if [ "$added" -gt 0 ] && [ "$modified" -eq 0 ] && [ "$deleted" -eq 0 ]; then
            commit_msg="Add new files"
        elif [ "$deleted" -gt 0 ] && [ "$added" -eq 0 ] && [ "$modified" -eq 0 ]; then
            commit_msg="Remove files"
        elif [ "$modified" -gt 0 ]; then
            commit_msg="Update files"
        else
            commit_msg="Update codebase"
        fi
    fi

    # Add stats
    local stats=""
    [ "$added" -gt 0 ] && stats+="+${added} "
    [ "$modified" -gt 0 ] && stats+="~${modified} "
    [ "$deleted" -gt 0 ] && stats+="-${deleted}"

    if [ -n "$stats" ]; then
        echo "[$name] $commit_msg ($stats)"
    else
        echo "[$name] $commit_msg"
    fi
}

# Function to sync a submodule
sync_submodule() {
    local name=$1
    local path=$2

    echo -e "\n${YELLOW}----------------------------------------${NC}"
    echo -e "${YELLOW}Syncing ${name}...${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"

    cd "$ROOT_DIR/$path" || { echo -e "${RED}Failed to enter $path${NC}"; return 1; }

    # Check if there are changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${GREEN}Changes detected in ${name}${NC}"
        git add .
        git status --short

        # Generate commit message
        local commit_msg=$(generate_commit_message "$path" "$name")
        echo -e "${BLUE}Generated commit message: ${NC}${commit_msg}"

        git commit -m "$commit_msg"

        echo -e "${YELLOW}Pushing ${name}...${NC}"
        git push

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}${name} pushed successfully${NC}"
        else
            echo -e "${RED}Failed to push ${name}${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}No changes in ${name}${NC}"
    fi

    return 0
}

# Sync frontend submodule
sync_submodule "Frontend" "peekachoo-frontend"
FRONTEND_STATUS=$?

# Sync backend submodule
sync_submodule "Backend" "peekachoo-backend"
BACKEND_STATUS=$?

# Now sync parent repo
echo -e "\n${YELLOW}----------------------------------------${NC}"
echo -e "${YELLOW}Syncing Parent Repository...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

cd "$ROOT_DIR" || { echo -e "${RED}Failed to enter root directory${NC}"; exit 1; }

# Check if submodule references changed or other files changed
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${GREEN}Changes detected in parent repo${NC}"
    git add .
    git status --short

    # Generate commit message for parent
    local_commit_msg=$(generate_commit_message "." "Parent")

    # Check if submodules were updated
    if git status --porcelain | grep -q "peekachoo-"; then
        local_commit_msg="[Parent] Update submodules"
    fi

    echo -e "${BLUE}Generated commit message: ${NC}${local_commit_msg}"
    git commit -m "$local_commit_msg"

    echo -e "${YELLOW}Pushing parent repo...${NC}"
    git push

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Parent repo pushed successfully${NC}"
    else
        echo -e "${RED}Failed to push parent repo${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}No changes in parent repo${NC}"
fi

# Update submodules to ensure everything is in sync
echo -e "\n${YELLOW}----------------------------------------${NC}"
echo -e "${YELLOW}Updating submodules...${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

git submodule update --remote --merge

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   Sync Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Show final status
echo -e "\n${YELLOW}Final Status:${NC}"
git status --short
git submodule status

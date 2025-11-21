#!/bin/bash
# Usage: ./build-push.sh [version] - if no version provided, auto-increments from latest tag

REPO_NAME=$(basename $(pwd))
IMAGE_BASE="ghcr.io/iiitkota/$REPO_NAME"

if [ -n "$1" ]; then
    VERSION="$1"
else
    # Get latest version from GitHub REST API or default to 0000
    source "$(dirname "$(pwd)")/.env"
    LATEST=$(curl -s -H "Authorization: Bearer $GITHUB_PAT" -H "Accept: application/vnd.github+json" "https://api.github.com/users/iiitkota/packages/container/$REPO_NAME/versions" | grep -o '"[0-9][0-9][0-9][0-9]"' | sed 's/"//g' | sort -n | tail -1)
    if [ -z "$LATEST" ]; then
        VERSION="0001"
    else
        VERSION=$(printf "%04d" $((10#$LATEST + 1)))
    fi
    echo "Auto-incrementing to version: $VERSION"
fi

IMAGE_NAME="$IMAGE_BASE:$VERSION"
BUILD_CONTEXT="."

# Special case for alumni-portal
if [ "$REPO_NAME" = "alumni-portal" ]; then
    BUILD_CONTEXT="./server"
fi

echo "Building and pushing: $IMAGE_NAME"
docker build -t $IMAGE_NAME $BUILD_CONTEXT
docker push $IMAGE_NAME

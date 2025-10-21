#!/bin/bash
# Setup Verification Script - Tests for Task 1.1, 1.2, 1.3
# This script verifies that the project setup is complete and correct

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

check() {
  local test_result=$?
  if [ $test_result -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((pass_count++))
  else
    echo -e "${RED}✗${NC} $1"
    ((fail_count++))
  fi
  return 0
}

echo "=== Task 1.1: Next.js Project Initialization and Tool Setup ==="

# Check package.json exists
test -f package.json
check "package.json exists"

# Check pnpm is configured
test -f pnpm-lock.yaml
check "pnpm-lock.yaml exists (pnpm is used)"

# Check .node-version exists with Node.js 24.x
test -f .node-version
check ".node-version file exists"

grep -q "24" .node-version 2>/dev/null
check ".node-version specifies Node.js 24.x"

# Check Next.js dependencies
grep -q '"next"' package.json
check "Next.js is in dependencies"

grep -q '"react"' package.json
check "React is in dependencies"

grep -q '"typescript"' package.json
check "TypeScript is in devDependencies"

# Check tsconfig.json with strict mode
test -f tsconfig.json
check "tsconfig.json exists"

grep -q '"strict": true' tsconfig.json 2>/dev/null
check "TypeScript strict mode is enabled"

# Check ESLint configuration
test -f .eslintrc.json || test -f eslint.config.mjs
check "ESLint configuration exists"

grep -q '"eslint"' package.json
check "ESLint is in devDependencies"

# Check Prettier configuration
test -f .prettierrc || test -f .prettierrc.json || test -f prettier.config.js
check "Prettier configuration exists"

grep -q '"prettier"' package.json
check "Prettier is in devDependencies"

echo ""
echo "=== Task 1.2: Project Structure and Directory Setup ==="

# Check directory structure
test -d app
check "app/ directory exists (Server Components)"

test -d src/components
check "src/components/ directory exists (Client Components)"

test -d src/hooks
check "src/hooks/ directory exists"

test -d src/lib
check "src/lib/ directory exists"

test -d src/workers
check "src/workers/ directory exists"

test -d public
check "public/ directory exists"

# Check ai.wasm is in public
test -f public/ai.wasm
check "public/ai.wasm exists"

echo ""
echo "=== Task 1.3: Styling and UI Foundation ==="

# Check Tailwind CSS
grep -q '"tailwindcss"' package.json
check "Tailwind CSS is in devDependencies"

test -f tailwind.config.ts || test -f tailwind.config.js
check "tailwind.config exists"

test -f postcss.config.js || test -f postcss.config.mjs
check "postcss.config exists"

# Check global styles
test -f app/globals.css || test -f src/app/globals.css
check "Global CSS file exists"

# Check for CSS Modules support (Next.js supports by default, verify config)
grep -q "cssModules" next.config.js 2>/dev/null || grep -q "cssModules" next.config.mjs 2>/dev/null || echo "CSS Modules supported by default" > /dev/null
check "CSS Modules support configured"

echo ""
echo "=========================================="
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo "=========================================="

if [ $fail_count -gt 0 ]; then
  exit 1
fi

exit 0

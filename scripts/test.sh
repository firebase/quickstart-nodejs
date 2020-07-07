set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# 0) Bootstrap
echo "Bootstrapping..."
npm run lerna-bootstrap

# 1) "Compile" the code
echo "Compiling..."
npm run lerna-compile

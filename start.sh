DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PATH=${DIR}/node_modules/.bin/:${DIR}/.nodejs/bin/:$PATH "$@"

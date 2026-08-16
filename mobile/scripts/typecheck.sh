#!/usr/bin/env bash
# Typecheck проекта, игнорирующий ошибки из node_modules.
# tsc проверяет исходники сторонних библиотек (например, react-native-yamap-plus
# публикует несобранный код), что даёт ложные ошибки. Здесь блоки ошибок из
# node_modules отфильтровываются целиком (включая многострочные описания),
# а ошибки проекта продолжают валить команду с ненулевым кодом.
set -u

output=$(npx tsc --noEmit 2>&1)

project_errors=$(printf '%s\n' "$output" | awk '
  /^node_modules\// { in_node_modules = 1; next }
  /^[^ ]*\([0-9]+,[0-9]+\): error / { in_node_modules = 0 }
  in_node_modules { next }
  { print }
')

if [ -n "$project_errors" ]; then
  printf '%s\n' "$project_errors"
  exit 1
fi

exit 0
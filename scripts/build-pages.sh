#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-pages}"
port="${PAGES_PORT:-4173}"
server_log="${RUNNER_TEMP:-/tmp}/mengji-pages-server.log"

mkdir -p "$output_dir"
npm run build
npm run start -- --port "$port" >"$server_log" 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" 2>/dev/null || true
}
trap cleanup EXIT

ready=0
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${port}/" -o "$output_dir/index.html"; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  cat "$server_log"
  exit 1
fi

cp -R dist/client/assets "$output_dir/assets"
cp -R dist/client/sites "$output_dir/sites"
for asset in favicon.svg og.png og-knowledge.png file.svg globe.svg window.svg; do
  if [ -f "dist/client/$asset" ]; then cp "dist/client/$asset" "$output_dir/$asset"; fi
done

# GitHub Pages serves this project under /mengji-shanghai-history/.
# Keep all browser-loaded assets relative so the same snapshot works there.
sed -i.bak \
  -e 's#https://mengji-shanghai-history.minmengxhw.chatgpt.site#https://minmengxhw-cpu.github.io/mengji-shanghai-history#g' \
  -e 's#"/assets/#"./assets/#g' \
  -e 's#"/sites/#"./sites/#g' \
  -e 's#"/favicon#"./favicon#g' \
  -e 's#"/og#"./og#g' \
  -e 's#\\"/assets/#\\"./assets/#g' \
  -e 's#css:/assets/#css:./assets/#g' \
  "$output_dir/index.html"
rm -f "$output_dir/index.html.bak"
cp "$output_dir/index.html" "$output_dir/404.html"

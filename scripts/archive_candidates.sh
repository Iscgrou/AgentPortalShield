#!/usr/bin/env bash
# Moves candidate non-critical files to archive/ for safe recovery.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
mkdir -p archive/attached_assets

# Exclude list (files to keep)
exclude=(
  "admin_cookies.txt"
  "admin-cookies.txt"
  "admin_cookies_fresh.txt"
  "admin_cookies_fixed.txt"
  "admin-cookies-new.txt"
  "cookies.txt"
)

move_if_candidate() {
  src="$1"
  # basename
  b=$(basename "$src")
  for ex in "${exclude[@]}"; do
    if [[ "$b" == "$ex" ]]; then
      echo "Skipping referenced/important file: $src"
      return
    fi
  done
  echo "Archiving: $src"
  # preserve path under archive
  dest="archive/$src"
  mkdir -p "$(dirname "$dest")"
  mv "$src" "$dest"
}

# Move top-level *.txt candidates (skip excluded)
for f in *.txt; do
  if [[ -f "$f" ]]; then
    move_if_candidate "$f"
  fi
done

# Move attached_assets pasted txts and other large paste files
for f in attached_assets/*.txt attached_assets/Pasted*; do
  if [[ -f "$f" ]]; then
    echo "Archiving attached asset: $f"
    dest="archive/$f"
    mkdir -p "$(dirname "$dest")"
    mv "$f" "$dest"
  fi

done

echo "Archive complete."

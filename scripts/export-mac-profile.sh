#!/usr/bin/env bash

set -euo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
bootstrap_script="$script_dir/bootstrap-new-mac.sh"

if [[ ! -f "$bootstrap_script" ]]; then
	echo "Missing companion script: $bootstrap_script" >&2
	exit 1
fi

usage() {
	cat <<'EOF'
Usage: export-mac-profile.sh [DESTINATION_DIRECTORY]

Creates a small ZIP of portable config and credential files. The destination
defaults to ~/Downloads for transfer with AirDrop.

Included paths cover shell, Git, SSH, AWS, developer-tool config, and selected
VS Code settings. Projects, documents, media, caches, histories, installed
tools, and general Library application state are not included. The ZIP is not
encrypted and must be handled as sensitive because it contains credentials.
EOF
}

format_bytes() {
	awk -v bytes="$1" 'BEGIN {
		split("B KiB MiB GiB TiB", units, " ")
		unit = 1
		while (bytes >= 1024 && unit < 5) {
			bytes /= 1024
			unit++
		}
		printf "%.1f %s", bytes, units[unit]
	}'
}

path_bytes() {
	if [[ -d "$1" ]]; then
		du -sk "$1" 2>/dev/null | awk '{print $1 * 1024}'
	else
		stat -f '%z' "$1" 2>/dev/null || printf '0'
	fi
}

monitor_file() {
	local label=$1
	local file=$2
	local process_id=$3
	local started_at=$SECONDS
	local bytes
	local exit_code

	while kill -0 "$process_id" 2>/dev/null; do
		bytes=$(path_bytes "$file")
		printf '\r%-12s %10s written, %4ss elapsed' \
			"$label" "$(format_bytes "$bytes")" "$((SECONDS - started_at))"
		sleep 2
	done

	if wait "$process_id"; then
		exit_code=0
	else
		exit_code=$?
	fi

	bytes=$(path_bytes "$file")
	printf '\r%-12s %10s written, %4ss elapsed\n' \
		"$label" "$(format_bytes "$bytes")" "$((SECONDS - started_at))"
	return "$exit_code"
}

if [[ $# -gt 1 ]]; then
	usage
	exit 1
fi

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
	usage
	exit 0
fi

destination=${1:-"$HOME/Downloads"}
mkdir -p "$destination"
destination=$(cd "$destination" && pwd -P)
archive="$destination/mac-config-$(date +%Y-%m-%d-%H%M%S).zip"
temporary_work_dir=$(mktemp -d "$destination/.mac-config-work.XXXXXX")
chmod 700 "$temporary_work_dir"
temporary_zip="$temporary_work_dir/profile.zip"
active_process_id=''
archive_complete=false

cleanup() {
	if [[ -n "$active_process_id" ]]; then
		kill "$active_process_id" 2>/dev/null || true
		wait "$active_process_id" 2>/dev/null || true
	fi

	rm -rf "$temporary_work_dir"
	if [[ "$archive_complete" != true ]]; then
		rm -f "$archive"
	fi
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

candidate_paths=(
	'.ssh'
	'.aws'
	'.config'
	'.docker/config.json'
	'.docker/contexts'
	'.cdk'
	'.gu'
	'.claude'
	'.copilot'
	'.vpn'
	'.oh-my-zsh/custom'
	'.zshrc'
	'.zprofile'
	'.zshenv'
	'.bashrc'
	'.bash_profile'
	'.profile'
	'.gitconfig'
	'.gitignore_global'
	'.inputrc'
	'.vimrc'
	'.ideavimrc'
	'.tmux.conf'
	'.tool-versions'
	'.npmrc'
	'.yarnrc'
	'.yarnrc.yml'
	'.bunfig.toml'
	'.netrc'
	'.pypirc'
	'Library/Application Support/Code/User/settings.json'
	'Library/Application Support/Code/User/keybindings.json'
	'Library/Application Support/Code/User/snippets'
	'Library/Application Support/Code/User/prompts'
	'Library/Application Support/Code/User/profiles'
	'Library/Preferences/com.apple.Terminal.plist'
	'Library/Preferences/com.googlecode.iterm2.plist'
)

included_paths=()
included_absolute_paths=()
for path in "${candidate_paths[@]}"; do
	if [[ -e "$HOME/$path" || -L "$HOME/$path" ]]; then
		included_paths+=("$path")
		included_absolute_paths+=("$HOME/$path")
	fi
done

if [[ ${#included_paths[@]} -eq 0 ]]; then
	echo "No matching configuration files were found under $HOME." >&2
	exit 1
fi

exclusions=(
	'.aws/cli/cache/*'
	'.aws/sso/cache/*'
	'.DS_Store'
)

socket_count=0
while IFS= read -r -d '' socket_path; do
	exclusions+=("${socket_path#"$HOME/"}")
	((socket_count += 1))
done < <(/usr/bin/find "${included_absolute_paths[@]}" -type s -print0 2>/dev/null)

echo "Creating $archive"
echo "Including ${#included_paths[@]} config paths; Projects and general Library state are excluded."
if [[ $socket_count -gt 0 ]]; then
	echo "Skipping $socket_count transient Unix socket files."
fi
echo "Warning: this unencrypted ZIP contains credentials such as SSH and AWS files."

cd "$HOME"
echo
echo "Compressing configuration"
COPYFILE_DISABLE=1 /usr/bin/zip -qry -y "$temporary_zip" \
	"${included_paths[@]}" -x "${exclusions[@]}" &
active_process_id=$!
if ! monitor_file "Compressing" "$temporary_work_dir" "$active_process_id"; then
	active_process_id=''
	echo "Configuration compression failed." >&2
	exit 1
fi
active_process_id=''

echo "Adding bootstrap-new-mac.sh"
/usr/bin/zip -qj "$temporary_zip" "$bootstrap_script"

mv "$temporary_zip" "$archive"
chmod 600 "$archive"
archive_complete=true
rm -rf "$temporary_work_dir"

cat <<EOF

Created: $archive

Verify the archive before retiring this Mac:
	unzip -t '$archive'

Restore it on the new Mac, then run bootstrap-new-mac.sh:
	cd "\$HOME"
	unzip '$archive'
	./bootstrap-new-mac.sh
EOF
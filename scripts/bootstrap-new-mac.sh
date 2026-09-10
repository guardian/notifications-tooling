#!/usr/bin/env bash

set -euo pipefail

NVM_VERSION=${NVM_VERSION:-0.40.6}
NODE_VERSION=${NODE_VERSION:-26.7.0}
NPM_VERSION=${NPM_VERSION:-11.19.0}
COREPACK_VERSION=${COREPACK_VERSION:-0.35.0}
PNPM_VERSION=${PNPM_VERSION:-12.3.4}
YARN_VERSION=${YARN_VERSION:-}
OH_MY_ZSH_VERSION=${OH_MY_ZSH_VERSION:-9112b53fa8b5ab556c7c893aa8be8a247ac512a0}

setup_oh_my_zsh() {
	local oh_my_zsh_dir="$HOME/.oh-my-zsh"

	if [[ ! -d "$oh_my_zsh_dir/.git" ]]; then
		if [[ -e "$oh_my_zsh_dir" ]]; then
			echo "$oh_my_zsh_dir exists but is not a Git checkout; move it aside and rerun." >&2
			exit 1
		fi

		git clone https://github.com/ohmyzsh/ohmyzsh.git "$oh_my_zsh_dir"
	fi

	git -C "$oh_my_zsh_dir" fetch --quiet origin "$OH_MY_ZSH_VERSION"
	git -C "$oh_my_zsh_dir" checkout --quiet "$OH_MY_ZSH_VERSION"
}

clone_projects() {
	local projects_dir="$HOME/Projects"
	local destination
	local repository
	local clone_failures=0

	mkdir -p "$projects_dir"

	while IFS=$'\t' read -r destination repository; do
		[[ -n "$destination" ]] || continue

		if [[ -e "$projects_dir/$destination" ]]; then
			echo "Skipping existing project: $destination"
			continue
		fi

		if ! git clone "$repository" "$projects_dir/$destination"; then
			echo "Failed to clone: $repository" >&2
			clone_failures=1
		fi
	done <<'EOF'
cdk	git@github.com:guardian/cdk.git
dev-nginx	git@github.com:guardian/dev-nginx.git
ios-live	git@github.com:guardian/ios-live.git
login.gutools	git@github.com:guardian/login.gutools.git
mobile-n10n	git@github.com:guardian/mobile-n10n.git
newsletters-nx	git@github.com:guardian/newsletters-nx.git
notifications-tooling	git@github.com:guardian/notifications-tooling.git
stand	git@github.com:guardian/stand.git
EOF

	if [[ $clone_failures -ne 0 ]]; then
		echo "Some projects could not be cloned. Check GitHub SSH access, then rerun this script." >&2
		return 1
	fi
}

if [[ $(uname -s) != "Darwin" ]]; then
	echo "This script supports macOS only." >&2
	exit 1
fi

if ! xcode-select -p >/dev/null 2>&1; then
	echo "Install Apple's command-line tools, then rerun this script:" >&2
	echo "  xcode-select --install" >&2
	exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

if [[ -x /opt/homebrew/bin/brew ]]; then
	eval "$(/opt/homebrew/bin/brew shellenv)"
else
	eval "$(/usr/local/bin/brew shellenv)"
fi

brew tap guardian/devtools
brew tap adoptopenjdk/openjdk
brew tap xcodesorg/made

brew install \
	aria2 \
	awscli \
	bun \
	guardian/devtools/dev-nginx \
	mint \
	node \
	sbt

setup_oh_my_zsh

export NVM_DIR="$HOME/.nvm"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
	if [[ -e "$NVM_DIR" ]]; then
		echo "$NVM_DIR exists but does not contain nvm.sh; move it aside and rerun." >&2
		exit 1
	fi

	git clone --depth 1 --branch "v$NVM_VERSION" https://github.com/nvm-sh/nvm.git "$NVM_DIR"
fi

# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"

nvm install "$NODE_VERSION"
nvm alias default "$NODE_VERSION"
nvm use "$NODE_VERSION"

npm install --global "npm@$NPM_VERSION" "corepack@$COREPACK_VERSION"
corepack enable
corepack install --global "pnpm@$PNPM_VERSION"

if [[ -n "$YARN_VERSION" ]]; then
	corepack install --global "yarn@$YARN_VERSION"
fi

zshrc="$HOME/.zshrc"
nvm_marker='# nvm bootstrap'

if ! grep -Fq "$nvm_marker" "$zshrc" 2>/dev/null; then
	cat >>"$zshrc" <<'EOF'

# nvm bootstrap
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
EOF
fi

echo
echo "Installed versions:"
printf 'Homebrew: %s\n' "$(brew --version | head -1)"
printf 'NVM:      %s\n' "$(nvm --version)"
printf 'Node:     %s\n' "$(node --version)"
printf 'npm:      %s\n' "$(npm --version)"
printf 'Bun:      %s\n' "$(bun --version)"
printf 'Corepack: %s\n' "$(corepack --version)"
printf 'pnpm:     %s\n' "$(cd "$HOME" && pnpm --version)"

if [[ -z "$YARN_VERSION" ]]; then
	echo "Yarn was not installed because no downloaded Yarn version was found on the old Mac."
	echo "Set YARN_VERSION and rerun to install a specific release."
fi

echo
echo "Cloning projects into $HOME/Projects"
clone_projects
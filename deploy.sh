#!/bin/bash
set -e

show_usage() {
	echo "Użycie: $0 [--authkey <klucz>]"
	echo "Przykład: $0 --authkey abcd"
	exit 1
}

log_info() {
	echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_warn() {
	echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

log_error() {
	echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" >&2
}

# Parsowanie parametrów
AUTHKEY=""
while [[ $# -gt 0 ]]; do
	case $1 in
		--authkey) AUTHKEY="$2"; shift ;;
		--env) shift ;; # ignoruj opcjonalny parametr dla wstecznej kompatybilności
		*) log_error "Nieznany parametr: $1"; show_usage ;;
	esac
	shift
done

DEPLOY_PATH="/var/app/senior-vigour/html"

TRANSLATIONS_DIR="/var/app/senior-vigour/cdn/translations"
TRANSLATIONS_ZIP="translations.zip"
TRANSLATIONS_TMP_DIR="translations_tmp"

# Debugowanie
log_info "Sprawdzanie środowiska przed konfiguracją:"
log_info "Użytkownik: $(whoami)"
log_info "Katalog domowy: $HOME"
log_info "Początkowy PATH: $PATH"

# Załaduj nvm
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"

# Aktywuj node
nvm use default || nvm use --lts || nvm use node

# Ustaw ścieżkę do npm
NPM_PATH="$HOME/.nvm/versions/node/$(node -v)/bin/npm"

# Sprawdź czy npm istnieje
if [ ! -f "$NPM_PATH" ]; then
	log_error "Nie znaleziono npm w: $NPM_PATH"
	exit 1
fi

log_info "Używam npm z: $NPM_PATH"
log_info "Node version: $(node -v)"
log_info "npm version: $("$NPM_PATH" -v)"

# === BUILD FRONTEND ===
log_info "Budowanie frontendu..."
cd package/senior-vigour || { log_error "Nie można przejść do katalogu package/senior-vigour"; exit 1; }

npm install || { log_error "npm install (frontend) zakończony błędem"; exit 1; }
npm run build || { log_error "npm run build zakończony błędem"; exit 1; }

log_info "Kopiowanie buildu do: $DEPLOY_PATH"
rm -rf "$DEPLOY_PATH"
cp -r dist "$DEPLOY_PATH"
sudo chown -R www-data "$DEPLOY_PATH"
log_info "Frontend wdrożony pomyślnie"

# === BUILD BACKEND ===
log_info "Uruchamianie backendu..."
cd ../backend || { log_error "Nie można przejść do katalogu backend"; exit 1; }

docker compose down || log_warn "docker compose down zakończony błędem (kontynuuję)"
npm install || { log_error "npm install (backend) zakończony błędem"; exit 1; }
docker compose --env-file .env build || { log_error "docker compose build zakończony błędem"; exit 1; }
docker compose --env-file .env up -d || { log_error "docker compose up zakończony błędem"; exit 1; }
log_info "Backend uruchomiony pomyślnie"

# === TŁUMACZENIA (operacja niekrytyczna) ===
cd ../..

fetch_translations() {
	if [[ -z "$AUTHKEY" ]]; then
		log_warn "Nie podano klucza autoryzacji (--authkey) — pomijam pobieranie tłumaczeń"
		return 0
	fi

	log_info "Pobieranie tłumaczeń..."
	if ! curl \
		--fail \
		--silent \
		--show-error \
		--location \
		--max-time 60 \
		'https://translations.seniorvigour-platform.eu/v2/projects/2/export?format=JSON' \
		--header "Accept: application/json" \
		--header "x-api-key: $AUTHKEY" \
		-o "$TRANSLATIONS_ZIP"; then
		log_warn "Pobieranie tłumaczeń zakończone błędem — pomijam"
		rm -f "$TRANSLATIONS_ZIP"
		return 0
	fi

	if [[ ! -s "$TRANSLATIONS_ZIP" ]]; then
		log_warn "Pobrany plik ZIP jest pusty — pomijam"
		rm -f "$TRANSLATIONS_ZIP"
		return 0
	fi

	log_info "Rozpakowywanie tłumaczeń..."
	rm -rf "$TRANSLATIONS_TMP_DIR"
	if ! unzip -o "$TRANSLATIONS_ZIP" -d "$TRANSLATIONS_TMP_DIR"; then
		log_warn "Rozpakowanie pliku ZIP zakończone błędem — pomijam"
		rm -f "$TRANSLATIONS_ZIP"
		rm -rf "$TRANSLATIONS_TMP_DIR"
		return 0
	fi

	log_info "Minifikowanie plików JSON i kopiowanie do: $TRANSLATIONS_DIR"
	local success_count=0
	local fail_count=0
	local jq_available=true
    
    if ! command -v jq &>/dev/null; then
        log_warn "Narzędzie 'jq' nie jest zainstalowane — pliki zostaną skopiowane bez minifikacji"
        jq_available=false
    fi

    while IFS= read -r -d '' json_file; do
        filename="$(basename "$json_file")"
        output_path="$TRANSLATIONS_DIR/$filename"

        if [[ "$jq_available" == true ]] && jq -c '.' "$json_file" > "$output_path"; then
            log_info "  ✓ $filename (zminifikowany)"
            ((success_count++)) || true
        else
            log_warn "  ✗ $filename — kopiuję oryginalny plik"
            cp "$json_file" "$output_path"
            ((fail_count++)) || true
        fi
    done < <(find "$TRANSLATIONS_TMP_DIR" -maxdepth 1 -name "*.json" -print0)

	log_info "Tłumaczenia: $success_count plików zminifikowanych, $fail_count z błędem"

	rm -f "$TRANSLATIONS_ZIP"
	rm -rf "$TRANSLATIONS_TMP_DIR"
}

if ! fetch_translations; then
	log_warn "Funkcja fetch_translations zakończyła się nieoczekiwanym błędem — kontynuuję"
fi

log_info "Pipeline zakończony pomyślnie"

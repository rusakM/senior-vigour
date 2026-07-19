#!/bin/bash
set -e

show_usage() {
	echo "Użycie: $0 --authkey abcd --location /ścieżka/do/katalogu"
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

AUTHKEY=""
CATALOGLOCATION=""
TRANSLATIONS_ZIP="translations.zip"
TRANSLATIONS_TMP_DIR="translations_tmp"

while [ "$#" -gt 0 ]; do
	case $1 in
		--authkey) AUTHKEY="$2"; shift ;;
		--location) CATALOGLOCATION="$2"; shift ;;
		*) log_error "Nieznany parametr: $1"; show_usage ;;
	esac
	shift
done

if [[ -z "$AUTHKEY" ]]; then
	log_error "Nie podano klucza autoryzacji (--authkey)"
	show_usage
fi

if [[ -z "$CATALOGLOCATION" ]]; then
	log_error "Nie podano lokalizacji katalogu (--location)"
	show_usage
fi

fetch_translations() {
	if [[ ! -d "$CATALOGLOCATION" ]]; then
		log_warn "Katalog docelowy nie istnieje: $CATALOGLOCATION — pomijam pobieranie tłumaczeń"
		return 0
	fi

	log_info "Katalog docelowy: $CATALOGLOCATION"
	log_info "Zawartość katalogu przed aktualizacją:"
	ls -lah "$CATALOGLOCATION" || log_warn "Nie można wylistować zawartości katalogu"

	log_info "Pobieranie tłumaczeń..."
	if ! curl \
		--fail \
		--silent \
		--show-error \
		--location \
		--max-time 60 \
		'https://pgtranslate.toadres.pl/v2/projects/34/export?format=JSON' \
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

	log_info "Minifikowanie plików JSON i kopiowanie do: $CATALOGLOCATION"
	local success_count=0
	local fail_count=0
    local jq_available=true
    
    if ! command -v jq &>/dev/null; then
        log_warn "Narzędzie 'jq' nie jest zainstalowane — pliki zostaną skopiowane bez minifikacji"
        jq_available=false
    fi

    while IFS= read -r -d '' json_file; do
        filename="$(basename "$json_file")"
        output_path="$CATALOGLOCATION/$filename"

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
	log_warn "Funkcja fetch_translations zakończyła się nieoczekiwanym błędem"
fi

log_info "Skrypt zakończony"
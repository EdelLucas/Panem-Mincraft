# Panem in Minecraft – Bauanleitung

Webseite, auf der ganz Panem (Kapitol, Distrikte 1–13 und die Arena) als Minecraft-Bauanleitung gezeigt wird – Block für Block im Maßstab 1:1.

## Funktionen
- **3D-Ansicht** jedes Bauwerks in Blöcken (drehen, zoomen, verschieben – auch per Touch)
- **Ebene für Ebene bauen:** „Bauen bis Ebene“ oder „Nur eine Ebene“, Pfeiltasten ↑/↓
- **Auseinandernehmen:** Ebenen spreizen oder das Gebäude in seine Bauteile (Fundament, Wände, Dach …) zerlegen; einzelne Bauteile ein-/ausblenden
- **Bauplan (Draufsicht)** jeder Ebene mit Koordinaten-Raster, Buchstaben-Kürzeln und Tooltip (Blockname + Minecraft-ID)
- **Materialliste** pro Ebene und gesamt, inklusive Stacks (64er)

## Bauwerke (23)
Kapitol: Präsidentenpalast, Trainingscenter, Tributenzug ·
D1 Juwelen-Manufaktur · D2 Die Nuss · D3 Elektronikfabrik · D4 Fischerhütte · D5 Kraftwerk · D6 Bahnhofshalle ·
D7 Sägewerk · D8 Textilfabrik · D9 Getreidesilos · D10 Viehstall · D11 Obstgarten mit Wachturm ·
D12 Justizgebäude, Bäckerei Mellark, Haus der Everdeens, Siegerdorf-Haus, Hob, Kohlemine, Zaun & Wiese ·
D13 Bunkereingang · Arena: Füllhorn

## Starten
Einfach `index.html` im Browser öffnen – oder per GitHub Pages veröffentlichen (Settings → Pages → Branch wählen). Keine Installation nötig; three.js liegt unter `js/vendor/`.

## Aufbau
- `js/blocks.js` – Block-Palette (deutsche Namen + Minecraft-IDs)
- `js/builder.js` – Voxel-Baukasten
- `js/buildings.js` – alle Bauwerke (neue Gebäude einfach hier ergänzen)
- `js/viewer.js` – 3D-Darstellung, `js/app.js` – Oberfläche

Inoffizielles Fan-Projekt; eigene Entwürfe nach Büchern/Filmen, keine offiziellen Pläne. Nicht verbunden mit Mojang, Microsoft oder Lionsgate.

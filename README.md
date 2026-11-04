# Panem in Minecraft – Bauanleitung

Webseite, auf der ganz Panem (Kapitol, Distrikte 1–13 und die Arena) als Minecraft-Bauanleitung gezeigt wird – Block für Block im Maßstab 1:1.

## Funktionen
- **3D-Ansicht** jedes Bauwerks in Blöcken (drehen, zoomen, verschieben – auch per Touch)
- **Ebene für Ebene bauen:** „Bauen bis Ebene“ oder „Nur eine Ebene“, Pfeiltasten ↑/↓
- **Auseinandernehmen:** Ebenen spreizen oder das Gebäude in seine Bauteile (Fundament, Wände, Dach …) zerlegen; einzelne Bauteile ein-/ausblenden
- **Bauplan (Draufsicht)** jeder Ebene mit Koordinaten-Raster, Buchstaben-Kürzeln und Tooltip (Blockname + Minecraft-ID)
- **Materialliste** pro Ebene und gesamt, inklusive Stacks (64er)

## Kapitol – echter Maßstab (1 Block = 1 Meter)
Nach Filmbildern nachgebaut, mit **Gesamtkarte**: jeder Abschnitt hat feste Koordinaten (Mitte des Stadtkreises = X 0 | Z 0), damit alles in Minecraft genau zusammenpasst.

| Abschnitt | Lage X | Lage Z |
|---|---|---|
| Stadtkreis (City Circle) | -75 … 75 | -75 … 75 |
| Paradeallee mit Tribünen | -60 … 60 | -296 … -76 |
| Trainingscenter | -60 … 60 | -357 … -297 |
| Präsidentenpalast | -65 … 65 | 80 … 230 |
| Prachtboulevard & Regierungspalast | 80 … 380 | -50 … 50 |
| Seepavillon | 100 … 200 | 70 … 170 |
| Goldkuppel | -140 … -80 | -230 … -170 |
| Hochhausviertel (18× platziert) | siehe Karte | |
| Tributenzug | frei platzierbar | |

Die Maße sind aus Filmbildern geschätzt (offizielle Pläne gibt es nicht).

## Distrikte & Arena
Noch frühe Entwürfe (nicht im echten Maßstab) – werden als Nächstes überarbeitet.

## Starten
Einfach `index.html` im Browser öffnen – oder per GitHub Pages veröffentlichen (Settings → Pages → Branch wählen). Keine Installation nötig; three.js liegt unter `js/vendor/`.

## Aufbau
- `js/blocks.js` – Block-Palette (deutsche Namen + Minecraft-IDs)
- `js/builder.js` – Voxel-Baukasten
- `js/buildings.js` – alle Bauwerke (neue Gebäude einfach hier ergänzen)
- `js/viewer.js` – 3D-Darstellung, `js/app.js` – Oberfläche

Inoffizielles Fan-Projekt; eigene Entwürfe nach Büchern/Filmen, keine offiziellen Pläne. Nicht verbunden mit Mojang, Microsoft oder Lionsgate.

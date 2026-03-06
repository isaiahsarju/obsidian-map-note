[![Node.js build](https://github.com/isaiahsarju/obsidian-map-note/actions/workflows/lint.yml/badge.svg)](https://github.com/isaiahsarju/obsidian-map-note/actions/workflows/lint.yml)

Requires [Obsidian 1.10](https://obsidian.md/changelog/2025-11-11-desktop-v1.10.3/). This project creates notes with the necessary properties to be rendered by the the [Obsidian Bases Map view](https://github.com/obsidianmd/obsidian-maps).
# Example Templates
You will need to specify a path to your template. To create a new note the plugin will fill in the template with values from OpenStreetMaps.
## Simple - Bare minimum, coordinates as list
```markdown
---
coordinates:
  - "{{lat}}"
  - "{{lon}}"
---
```
## Simple - Bare minimum, coordinates as string
```markdown
---
coordinates: "{{lat}}, {{lon}}"
---
```
## Simple - Bare minimum with icon
```markdown
---
coordinates:
  - "{{lat}}"
  - "{{lon}}"
icon: "{{lucide_icon}}"
---
```
## Custom Example
```markdown
---
coordinates:
  - "{{lat}}"
  - "{{lon}}"
address: "{{display_name}}"
icon: "{{lucide_icon}}"
color: "{{color}}"
recommended by:
osm: "{{osm_id}}"
concepts:
tags:
  - place
  - want-to-go
---
```
## Data and Types
The OSM and plugin generated data is available for insertion into the template.
### OSM Generated JSON Data and Types
Your template can have the following properties set. Bare minimum you need `coordinates`. You can use the following keys as `{{key}}` in your template file. `lat` and `lon` are required in the whatever field maps to the Bases Map view `coordinates`. See the official Obsidian Bases Map view guidance [here](https://help.obsidian.md/bases/views/map)

| key          | value type | importance                                  |
| ------------ | ---------- | ------------------------------------------- |
| addresstype  | `string`   | Used as backup for icon resolution          |
| boundingbox  | `string[]` |                                             |
| class        | `string`   | Used as backup for icon resolution          |
| display_name | `string`   | The formal "address"                        |
| importance   | `number`   |                                             |
| lat          | `string`   | Latitude. **Required to add point on map**  |
| licence      | `string`   |                                             |
| lon          | `string`   | Longitude. **Required to add point on map** |
| name         | `string`   | Use for default file name                   |
| osm_id       | `number`   |                                             |
| osm_type     | `string`   |                                             |
| place_id     | `number`   |                                             |
| place_rank   | `number`   |                                             |
| type         | `string`   | Used for icon resolution                    |
### Plugin Generated JSON Data and Types

| key         | value type | importance                               |
| ----------- | ---------- | ---------------------------------------- |
| lucide_icon | `string`   | Icon that shows up on the map            |
| color       | `string`   | A valid CSS value: hex, RGB, named color |
# To Do
- [ ] https://fevol.github.io/obsidian-notes/notes/tutorials/showcase-plugin-and-theme-downloads/
- [ ] Add the thing to readme to instruct folks how to update it
- [ ] Open issues for todos
- [ ] Create blank note if file doesn't exist
- [ ] https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions
# Disclosures
## Network Access
Uses [Nominatim web API](https://nominatim.org/release-docs/develop/api/Overview/) for accessing [OpenStreetMaps](https://www.openstreetmap.org/about) Data.
## LLM Usage
Limited use of LLMs during development. Reserved for synthesizing search results. No code has been generated using LLMs.

If committing to this project please indicate in code comments when and where LLMs or "AI" was used.
# Greetz
Chunks code plagiarized from [anpigon's book search plugin](https://github.com/anpigon/obsidian-book-search-plugin/), using my mind's artificial intelligence
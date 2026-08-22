# Atlas Platform / Adventure research notebook

Checked at: 2026-08-11

Scope: first Genre Family content batch for the Platform and jumping-game lineage and the Parser adventure to graphical adventure lineage. Families are navigation labels, not exclusive classifications. Dates or shared tags never create an edge by themselves.

## Backend record

| Action | Backend | Status | checkedAt | Note |
| --- | --- | --- | --- | --- |
| Environment check | `agent-reach doctor --json` | completed | 2026-08-11 | Reported Exa via mcporter and Jina Reader as available. |
| Semantic discovery | Exa via mcporter | blocked | 2026-08-11 | Four calls returned HTTP 429 because the free MCP quota was exhausted. No key was added. |
| Search fallback | Jina Search | blocked | 2026-08-11 | `s.jina.ai` returned 401 and required an API key. No key was added. |
| URL discovery fallback | Codex web search | completed | 2026-08-11 | Used only to locate official, museum, participant, and archival pages after both Agent Reach discovery routes failed. |
| Source retrieval | Jina Reader | completed | 2026-08-11 | Retrieved and inspected the selected URLs through `r.jina.ai`; locators below refer to the retrieved page structure. |

## Candidate decisions

| Candidate | Decision | Evidence locator | Bounded claim | status | backend | checkedAt |
| --- | --- | --- | --- | --- | --- | --- |
| Space Panic | include node | Museum of the Game, Description and Specs | Universal released it in 1980; ladders connect floors and digging traps enemies. No Donkey Kong edge is claimed. | verified | Jina Reader | 2026-08-11 |
| Donkey Kong | include node | The Strong, exhibit narrative paragraphs 2-5 | Supports the 1981 date, Miyamoto authorship, and jumping, ladders, slopes, and multiple scenes. | verified | Jina Reader | 2026-08-11 |
| Mario Bros. | include node | Iwata Asks, The Grand Culmination | Miyamoto identifies the arcade Mario Bros. as about two years before Super Mario Bros.; the development specification names its enemy and POW Block elements. | verified | Jina Reader | 2026-08-11 |
| Super Mario Bros. | include node | Iwata Asks, The Grand Culmination | Developers describe it as an intentional culmination of specific earlier Nintendo elements, not a single-source invention. | verified | Jina Reader | 2026-08-11 |
| Sonic the Hedgehog | include node | The Strong, exhibit narrative paragraphs 1-4 | Supports the 1991 release, speed-focused structures, and Sega's in-house effort to create a Mario rival. | verified | Jina Reader | 2026-08-11 |
| Celeste | include node | Official homepage lead and credits; Nintendo product page, Release date | The creators describe a hand-crafted platformer about helping Madeline climb Celeste Mountain; Nintendo lists January 25, 2018. No historical influence edge is asserted. | verified | Jina Reader | 2026-08-11 |
| Colossal Cave Adventure | include node | The Strong, exhibit narrative paragraphs 2-6 | Supports the 1976 Crowther build, Woods expansion, text-command cave exploration, and bounded institutional influence claims. | verified | Jina Reader | 2026-08-11 |
| Zork | include node | The Strong, Colossal Cave paragraph 5; ACMI collection description | The Strong explicitly lists Zork among inspired works; ACMI supports the 1977 MIT/PDP-10 version and later Infocom home-computer rework. | verified | Jina Reader | 2026-08-11 |
| Mystery House | include node | The Strong, Colossal Cave Did You Know; Sierra On-Line collection Historical Note | The museum states that Colossal Cave inspired Roberta Williams to create Mystery House; its archive supports the 1980 Apple II, On-Line Systems, text-and-graphics, and Williams collaboration facts. | verified | Jina Reader | 2026-08-11 |
| King's Quest | include node | The Strong, exhibit narrative paragraphs 1-4 | Supports the 1984 IBM PCjr release, text parser, movable character, and pseudo three-dimensional graphical space. | verified | Jina Reader | 2026-08-11 |
| Maniac Mansion | include node | Game Developer GDC report; Lucasfilm SCUMM history | Gilbert's participant account supports the King's Quest response and point-and-click design; Lucasfilm supports SCUMM creation. | verified | Jina Reader | 2026-08-11 |
| The Secret of Monkey Island | include node | Lucasfilm SCUMM history, later-title paragraph | Lucasfilm explicitly records that the SCUMM system created for Maniac Mansion was revised and used for the 1990 game. | verified | Jina Reader | 2026-08-11 |

Result: 12 included nodes, within the approved 8-14 node batch. The two lineages reuse the global Atlas and do not create duplicate identities.

## Included relation evidence

| Relation | Evidence locator | Bounded claim | status | backend | checkedAt |
| --- | --- | --- | --- | --- | --- |
| Donkey Kong -> Super Mario Bros. | Iwata Asks, development specification | The specification names Donkey Kong slopes, lifts, conveyor belts, and ladders as elements to refine. | confirmed | Jina Reader | 2026-08-11 |
| Mario Bros. -> Super Mario Bros. | Iwata Asks, development specification | The specification names Mario Bros. enemy attacks, movement, frozen platforms, and POW Blocks as inputs. | confirmed | Jina Reader | 2026-08-11 |
| Colossal Cave Adventure -> Zork | The Strong, Colossal Cave paragraph 5 | The museum explicitly lists Zork among inspired works. Without participant testimony in this batch, the relation remains credible. | credible | Jina Reader | 2026-08-11 |
| Colossal Cave Adventure -> Mystery House | The Strong, Did You Know | The museum explicitly states that playing Colossal Cave inspired Roberta Williams to create Mystery House. Without a participant transcript in this batch, the relation remains credible. | credible | Jina Reader | 2026-08-11 |
| King's Quest -> Maniac Mansion | Game Developer GDC report, paragraph beginning `A Christmas trip home changed everything` | Gilbert says watching King's Quest made Maniac Mansion fall into place and that frustration with its parser prompted the screen-verb interface. | confirmed | Jina Reader | 2026-08-11 |
| Maniac Mansion -> The Secret of Monkey Island | Lucasfilm SCUMM history, paragraphs 3-6 | Lucasfilm records that SCUMM was created for Maniac Mansion, then revised and used for The Secret of Monkey Island. The edge expresses technical lineage only. | confirmed | Jina Reader | 2026-08-11 |

## Exclusions and unresolved claims

| Candidate claim | Decision | Reason | status | backend | checkedAt |
| --- | --- | --- | --- | --- | --- |
| Space Panic -> Donkey Kong | exclude edge | The museum object supports Space Panic's node facts, but this batch found no participant or institutional source that specifically documents Donkey Kong deriving from it. | unresolved | Jina Reader | 2026-08-11 |
| Super Mario Bros. -> Celeste | exclude edge | Celeste's official page supports the node description but does not name Super Mario Bros. or another included game as a direct influence. | unresolved | Jina Reader | 2026-08-11 |
| Super Mario Bros. -> Sonic the Hedgehog | exclude edge | The Strong documents an effort to create a rival to the Mario character, but does not identify Super Mario Bros. as the specific work endpoint. The competitive context remains in Sonic's node evidence only. | unresolved | Jina Reader | 2026-08-11 |
| Mystery House -> King's Quest | exclude edge | Both belong to Roberta Williams's graphical-adventure history, but shared authorship and chronology alone do not establish the requested relationship semantics. | unresolved | Jina Reader | 2026-08-11 |
| Space Panic or Donkey Kong as the absolute first platform game | exclude claim | The answer depends on whether climbing without jumping is included and on the chosen platform-game definition. The Atlas records structures and dates without an absolute-first label. | disputed definition | museum discovery and Jina Reader | 2026-08-11 |
| Mystery House as the absolute first graphical adventure | exclude claim | The batch does not define every geographic, platform, image, or parser boundary needed for an absolute-first statement. | bounded out | Jina Reader | 2026-08-11 |
| One work invented adventure or point-and-click games | exclude claim | The evidence supports bounded design responses and technical lineage, not sole invention of a broad category. | bounded out | Jina Reader | 2026-08-11 |

## Selected sources

| Evidence ID | URL | sourceKind | institutionOrAuthor | publicationDate | locator | status | backend | checkedAt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `museum-of-game-space-panic` | https://www.arcade-museum.com/Videogame/space-panic | museum-object | International Arcade Museum / Museum of the Game | undated | Description and Specs | included | Jina Reader | 2026-08-11 |
| `strong-donkey-kong` | https://www.museumofplay.org/games/donkey-kong/ | museum-object | The Strong National Museum of Play | 2021-08-20 | Exhibit paragraphs 2-5 | included | Jina Reader | 2026-08-11 |
| `nintendo-original-super-mario-developers` | https://iwataasks.nintendo.com/interviews/wii/mario25th/4/2/ | oral-history | Iwata, Miyamoto, Nakago / Nintendo | 2010 | The Grand Culmination | included | Jina Reader | 2026-08-11 |
| `strong-sonic-the-hedgehog` | https://www.museumofplay.org/games/sonic-the-hedgehog/ | museum-object | The Strong National Museum of Play | 2021-08-20 | Exhibit paragraphs 1-4 | included | Jina Reader | 2026-08-11 |
| `celeste-official-site` | https://www.celestegame.com/ | institutional-history | Maddy Makes Games / Extremely OK Games | undated | Homepage lead and credits | included | Jina Reader | 2026-08-11 |
| `strong-colossal-cave-adventure` | https://www.museumofplay.org/games/colossal-cave-adventure/ | museum-object | The Strong National Museum of Play | 2021-08-20 | Paragraphs 2-6 and Did You Know | included | Jina Reader | 2026-08-11 |
| `strong-kings-quest` | https://www.museumofplay.org/games/kings-quest/ | museum-object | The Strong National Museum of Play | 2021-08-20 | Exhibit paragraphs 1-4 | included | Jina Reader | 2026-08-11 |
| `gamedeveloper-maniac-mansion-gdc` | https://www.gamedeveloper.com/game-platforms/gdc-2011-ron-gilbert-s-odd-collection-of-i-maniac-mansion-i-memories | oral-history | Ron Gilbert / GDC; Game Developer report | 2011-03-04 | Christmas trip paragraph | included | Jina Reader | 2026-08-11 |
| `lucasfilm-scumm-history` | https://www.lucasfilm.com/news/lucasfilm-originals-scumm/ | institutional-history | Lucas O. Seastrom / Lucasfilm | 2021 | Paragraphs 3-6 | included | Jina Reader | 2026-08-11 |
| `nintendo-celeste-release` | https://www.nintendo.com/us/store/products/celeste-switch/ | institutional-history | Nintendo | undated | About this item; Release date | included | Jina Reader | 2026-08-11 |
| `acmi-zork` | https://www.acmi.net.au/works/125370--zork/ | museum-object | ACMI | undated | Collection description paragraphs 1-3 | included | Jina Reader | 2026-08-11 |
| `strong-sierra-collection` | https://archives.museumofplay.org/repositories/3/resources/18 | institutional-history | The Strong National Museum of Play | 2013-05-01 | Historical Note paragraphs 1-2 | included | Jina Reader | 2026-08-11 |

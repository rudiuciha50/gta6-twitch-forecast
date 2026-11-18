# GTA VI Twitch CCU Forecast

[![make.fun](https://make.fun/badge/gta6-twitch-ccu-forecast-01.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01)
[![Rank](https://make.fun/badge/gta6-twitch-ccu-forecast-01/rank.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01/entries)
[![Repo Rank](https://make.fun/badge/gta6-twitch-ccu-forecast-01/rudiuciha50/gta6-twitch-forecast/rank.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01/entries)

Forecast GTA VI's launch-day Twitch viewers hour by hour for the [make.fun bounty](https://make.fun/bounty/gta6-twitch-ccu-forecast-01).

## Model

Hour 1's print (p1) anchors the forecast. An intraday shape learned from comparable console launches scales p1 through the UTC day — a shallow U-curve in log space with a spread that widens linearly.

## Entrypoint

```sh
node /bot/main.ts  # Node 22, standard library only
```

## License

MIT — see [LICENSE](LICENSE).

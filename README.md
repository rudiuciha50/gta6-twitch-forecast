# GTA VI Twitch CCU Forecast

[![make.fun · gta6-twitch-ccu-forecast-01](https://make.fun/badge/gta6-twitch-ccu-forecast-01.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01)
[![rank](https://make.fun/badge/gta6-twitch-ccu-forecast-01/rudiuciha50/gta6-twitch-forecast/rank.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01)
[![reward](https://make.fun/badge/gta6-twitch-ccu-forecast-01/rudiuciha50/gta6-twitch-forecast/reward.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01)

Forecast GTA VI's launch-day Twitch viewers hour by hour for the [make.fun bounty](https://make.fun/bounty/gta6-twitch-ccu-forecast-01).

## Model

Hour 1's print (p1) anchors the forecast. An intraday shape learned from comparable console launches scales p1 through the UTC day — a shallow U-curve in log space with a spread that widens linearly: sigma(h) = 0.24 + 0.02*(h-1). Five quantiles are computed as exp(ln(median) + z_tau * sigma(h)) for each hour 2-24.

## Run

```sh
node /bot/main.ts
```

Standard library only, Node 22. Reads `/input/*.in`, writes `/output/*.out`.

## License

MIT

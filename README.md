# mcsr-ranked-widget
## About
This is mcsr-ranked widget for [OBS](https://obsproject.com/) that shows the player rankings of the [mcsr ranked](https://mcsrranked.com/). Such as his rank name, elo, elo difference, played matches and win/loss ratio.
The widget shows all these stats based on startTime and updates every 2 minutes (so if you dont see any changes, just wait a bit).

![Widget Example](https://i.imgur.com/KtEXrnP.png)

## Usage
1. Go to /generator and set all the settings you want.
2. Click on "Generate" and copy the generated URL.
3. Add a new browser source in OBS and paste the URL. (Recommended width: 300px, height: 100px)

## Endpoints
Defualt domain is `https://not-yet-deployed.domain.com/`.
- `/` - Contains the documentation.
- `/generator` - Contains the generator for the widget.
- `/widget` - Contains the widget itself.

There are some endpoints that are used for the widget to set time:
- `/widget/now` - This widget will set startTime to the current time. So it will show data from now to the future.
- `/widget/[time]` - This widget will set startTime to the given time. So it will show data from the given time to the future.

All widget endpoints are using "player" query parameter to set the player name. If the player name is not found, it will show an error message.

## Examples
` /widget/now?player=7rowl` - This will show the widget for 7rowl from now to the future.
` /widget/2021-10-10T00:00:00Z?player=7rowl` - This will show the widget for 7rowl from 2021-10-10 to the future.
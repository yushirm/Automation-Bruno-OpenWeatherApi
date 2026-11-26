# Automation-Bruno-OpenWeatherApi

A test automation project using [Bruno](https://www.usebruno.com/) that targets the [Open Weather Map Weather Stations API](https://openweathermap.org/stations). It is a port of [Automation-Postman-OpenWeatherApi](https://github.com/yushirm/Automation-Postman-OpenWeatherApi), with extra tests for the gaps the Postman suite left.

Ported from my Postman suite using Claude Code, with the extra coverage added at my direction.

## Test design approach

Positive tests follow normal use: register, get, list, update, send measurements, get measurements and delete a station. Negative tests cover missing or incorrect API keys, wrong data types, malformed JSON, missing required fields and unknown station IDs.

The positive tests create and delete a real station and send measurements to it. Run them against a throwaway station on your own account.

```
Stations Tests/
  Positive Test Cases/          full station and measurement lifecycle
  Negative Test Cases/
    No Auth/                    no appid, expect 401
    Incorrect Auth/             random appid, expect 401
    Incorrect Data Types/       text latitude, expect 400
    Invalid Requests/           unknown id, malformed JSON, missing name
Measurements Tests/
  Negative Test Cases/          no auth, incorrect auth, text temperature, missing limit
```

## Getting started

1. Install [Bruno](https://www.usebruno.com/downloads) 2.x or newer, or the CLI: `npm install -g @usebruno/cli`. Older versions do not resolve the `{{$random...}}` dynamic variables.
2. Clone this repository.
3. In Bruno choose **Open Collection** and select the cloned folder.
4. Pick the **OpenWeatherApi** environment (top right).
5. Get an API key by [registering](https://openweathermap.org/appid#signup), then copy `.env.example` to `.env` and paste the key after `OPENWEATHER_API_KEY=`. Bruno reads `.env` from the collection root, and git ignores it, so the key is never committed.

## Running the tests

In the app: right-click the collection and choose **Run**.

From the command line, run everything from the collection folder. The CLI reads the same `.env` file:

```bash
bru run --env OpenWeatherApi
```

The `No Auth` and `Incorrect Auth` folders need no key:

```bash
bru run "Stations Tests/Negative Test Cases/No Auth" --env OpenWeatherApi
```

## Future work

- Add a CI workflow and require it in the `main` branch ruleset.
- Boundary tests (latitude and longitude range, name length, duplicate `external_id`). The API docs do not state the limits, so they are not guessed here.

## Tools used

- [Bruno](https://www.usebruno.com/)
- [Claude Code](https://claude.com/claude-code)

## License

MIT, see [LICENSE](LICENSE).

## Authors

- [yushirm](https://www.linkedin.com/in/yushir-rugnath-maharaj-44b86222/) - Design and direction
- [Claude Code](https://claude.com/claude-code) - Implementation

# Automation-Bruno-OpenWeatherApi

A test automation project using [Bruno](https://www.usebruno.com/) that targets the [Open Weather Map Weather Stations API](https://openweathermap.org/stations). It is a port of [Automation-Postman-OpenWeatherApi](https://github.com/yushirm/Automation-Postman-OpenWeatherApi), with extra tests for the gaps the Postman suite left.

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

1. Install [Bruno](https://www.usebruno.com/downloads), or the CLI: `npm install -g @usebruno/cli`.
2. Clone this repository.
3. In Bruno choose **Open Collection** and select the cloned folder.
4. Pick the **OpenWeatherApi** environment (top right).
5. Get an API key by [registering](https://openweathermap.org/appid#signup), then paste it into the `APIKey` variable of the environment. Bruno keeps secret values on your machine only, so the key is never committed.

## Running the tests

In the app: right-click the collection and choose **Run**.

From the command line, keep your key in a `.env` file (ignored by git, see `.env.example`):

```bash
cp .env.example .env
```

Then run everything:

```bash
set -a; . ./.env; set +a
bru run --env OpenWeatherApi --env-var APIKey="$OPENWEATHER_API_KEY"
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

## Authors

- [yushirm](https://www.linkedin.com/in/yushir-rugnath-maharaj-44b86222/) - Initial design and coding

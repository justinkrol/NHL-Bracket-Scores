const TEAM_CODES = {
    "Colorado Avalanche": "COL",
    "Seattle Kraken": "SEA",
    "Dallas Stars": "DAL",
    "Minnesota Wild": "MIN",
    "Vegas Golden Knights": "VGK",
    "Winnipeg Jets": "WPG",
    "Edmonton Oilers": "EDM",
    "Los Angeles Kings": "LAK",
    "Boston Bruins": "BOS",
    "Florida Panthers": "FLA",
    "Toronto Maple Leafs": "TOR",
    "Tampa Bay Lightning": "TBL",
    "Carolina Hurricanes": "CAR",
    "New York Islanders": "NYI",
    "New Jersey Devils": "NJD",
    "New York Rangers": "NYR",
}

const API_BASE = "https://statsapi.web.nhl.com/api/v1"
const endpoint = "tournaments/playoffs"
const params = [
    ["expand", "round.series,schedule.game.seriesSummary"],
    ["season", "20222023"],
]
const paramsStr = params.map(pair => `${pair[0]}=${pair[1]}`).join("&")
const fullPath = `${API_BASE}/${endpoint}?${paramsStr}`

// This returns an array with four objects, one for each round.
const parseData = (data) => {
    return data.rounds.map(round => {
        if (!!round.series[0].matchupTeams) {
            const winsByTeamCode = parseRound(round)

            return {
                number: round.number,
                winsByTeamCode,
            }
        }
        return null
    }).filter(Boolean)
}

// This parses data for a round and returns a single-level object with the number of wins per team:
//  - key => team code (ex. EDM)
//  - value => # of wins (ex. 3)
const parseRound = (round) => {
    const winsByTeamCode = {}
    round.series.forEach(matchup => {
        matchup.matchupTeams.forEach(matchupTeam => {
            const teamFullName = matchupTeam.team.name
            const teamCode = TEAM_CODES[teamFullName]
            winsByTeamCode[teamCode] = matchupTeam.seriesRecord.wins
        })
    })
    return winsByTeamCode
}

const addScoreBadgesOnPage = (parsedData) => {
    // Matchup cards have an id that looks like: `match_1xx_card`, where 1 represents Round 1, and xx represents the series id
    parsedData.forEach(round => {
        const teamCodes = Object.keys(round.winsByTeamCode)

        const matchCardsQuery = `[id*='match_${round.number}']`
        document.querySelectorAll(matchCardsQuery).forEach(element => {

            // `element` is a matchup card div. Need to dig down a bit to find the spans with team codes
            element.querySelectorAll('span').forEach(spanElement => {
                if (!teamCodes.includes(spanElement.textContent)) return

                const numWins = round.winsByTeamCode[spanElement.textContent]
                spanElement.textContent += ` ${numWins}`
            })
        })
    })
}

const run = () => {
    fetch(fullPath)
        .then(response => {
            return response.json()
        })
        .then(data => {
            const parsedData = parseData(data)
            addScoreBadgesOnPage(parsedData)
        })
}

// Wait for the full page to be rendered before trying to modify it
setTimeout(run, 8000)

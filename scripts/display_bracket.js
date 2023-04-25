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

const parseData = (data) => {
    console.log(data.rounds[0])
    return data.rounds.map(round => {
        if (!!round.series[0].matchupTeams) {
            const conferenceScores = {
                eastern: [],
                western: [],
            }
            round.series.forEach(matchup => {
                const winsByTeamName = {}
                matchup.matchupTeams.forEach(matchupTeam => {
                    const teamFullName = matchupTeam.team.name
                    winsByTeamName[teamFullName] = matchupTeam.seriesRecord.wins
                })
                conferenceScores[matchup.conference.name.toLowerCase()].push(winsByTeamName)
            })

            return {
                number: round.number,
                conferenceScores,
            }
        }
        return null
    }).filter(Boolean)
}

const addSeriesScoresToPage = (seriesScoresByRound) => {
    console.log(seriesScoresByRound)
    const currentRoundConferenceScores = seriesScoresByRound.sort((a, b) => {
        return b.number - a.number
    })[0].conferenceScores

    Object.keys(currentRoundConferenceScores).forEach(conferenceName => {
        const divId = `${conferenceName}-scores`
        const divElement = document.getElementById(divId)

        const seriesScores = currentRoundConferenceScores[conferenceName]
        seriesScores.forEach(seriesScore => {
            const teamNames = Object.keys(seriesScore)
            const teamA = teamNames[0]
            const teamB = teamNames[1]

            const scoreText = `${TEAM_CODES[teamA]} ${seriesScore[teamA]} - ${TEAM_CODES[teamB]} ${seriesScore[teamB]}`
            const scoreTextNode = document.createTextNode(scoreText)
            const scoreNode = document.createElement('p')
            scoreNode.appendChild(scoreTextNode)

            divElement.appendChild(scoreNode)
        })
    })
}

fetch(fullPath)
    .then(response => {
        return response.json()
    })
    .then(data => {
        const parsedData = parseData(data)
        addSeriesScoresToPage(parsedData)
    })

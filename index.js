const path = require('path')
const fs = require('fs')
const { match } = require('assert')

const inputFile = process.argv[2]
const filePath = path.resolve(__dirname, inputFile)

const extractTeamNameAndScore = teamInfo => teamInfo.reduce((arr, val) => {
  const score = parseInt(val, 10)

  if (isNaN(score)) {
    if (arr[0]) return [`${arr[0]} ${val}`, arr[1]]
    else return [val, 0]
  }

  return [arr[0], score]
}, ['', 0])

const getTotalScore = matches => {
  const scoreBoard = {}

   matches.forEach(match => {

    if (match === '') return

    const teamAndScores = match.split(',')
    const [teamA, teamB] = teamAndScores.splice(' ')

    const teamAInfo = teamA.trim().split(' ')
    const teamBInfo = teamB.trim().split(' ')
    const [teamAName, teamAScore] = extractTeamNameAndScore(teamAInfo)
    const [teamBName, teamBScore] = extractTeamNameAndScore(teamBInfo)
    const scoreBoardTeamA = scoreBoard[teamAName]
    const scoreBoardTeamB = scoreBoard[teamBName]

    if (teamAScore === teamBScore) {
      scoreBoard[teamAName] = scoreBoardTeamA ? scoreBoardTeamA + 1 : 1
      scoreBoard[teamBName] = scoreBoardTeamB ? scoreBoardTeamB + 1 : 1
      return
    }

    if (teamAScore > teamBScore) {
      scoreBoard[teamAName] = scoreBoardTeamA ? scoreBoardTeamA + 3 : 3

      if (!scoreBoard[teamBName]) scoreBoard[teamBName] = 0
      return
    }

    scoreBoard[teamBName] = scoreBoardTeamB ? scoreBoardTeamB + 3 : 3
  })

  return scoreBoard
}

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`read file error: ${err}`)
    process.exit(1)
  }

  const matches = data.split('\n')
  const totalScores = getTotalScore(matches)
  const pointList = []
  const teamRanking = []

  Object.keys(totalScores).map(teamName => pointList.push({
    teamName,
    points: totalScores[teamName]
  }))

  const sortedPointList = pointList.sort((a, b) => a.points > b.points ? -1 : 1)

  sortedPointList
    .forEach((team, index) => {
      const points = team.points
      let ranking = 0

      if (index === 0) {
        ranking = 1
        teamRanking.push({ ranking, points, teams: [team.teamName] })
      }
      else {
        const lastTeamInTeamRanking = teamRanking[teamRanking.length - 1]
        if (lastTeamInTeamRanking.points === points) {
          lastTeamInTeamRanking.teams.push(team.teamName)
        }
        else {
          if (lastTeamInTeamRanking.teams.length > 1) lastTeamInTeamRanking.teams = lastTeamInTeamRanking.teams.sort()

          teamRanking.push({
            ranking: lastTeamInTeamRanking.ranking + lastTeamInTeamRanking.teams.length,
            points,
            teams: [team.teamName]
          })
        }
      }
    })

  teamRanking.forEach(rankingInfo => {
    rankingInfo.teams.forEach(teamName => {
      console.log(`${rankingInfo.ranking}.`, `${teamName},`, `${rankingInfo.points} pts`)
    })
  })
})

const config = require('../config.json')
const mysql = require('mysql')

const express = require('express')
const router = express.Router()

const JSSoup = require('jssoup').default
const request = require('request')

const connection = mysql.createConnection({
	host: config.rds_host,
	user: config.rds_user,
	password: config.rds_password,
	port: config.rds_port,
	database: config.rds_db
});
connection.connect();

async function queryDB(query, res) {
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log(error)
			res.json({ error: error })
		} else if (results) {
			res.json({ results: results })
		}
	})
}

router.get('/search', async (req, res) => {
  const title = req.query.title ? `'%${req.query.title}%'` : `'%%'`
  const runtimeLow = req.query.runtimeLow ? `${req.query.runtimeLow}` : `'%%'`
  const runtimeHigh = req.query.runtimeHigh ? `${req.query.runtimeHigh}` : `'%%'`
  const yearLow = req.query.yearLow ? `${req.query.yearLow}` : `'%%'`
  const yearHigh = req.query.yearHigh ? `${req.query.yearHigh}` : `'%%'`
  const voteLow = req.query.voteLow ? `${req.query.voteLow}` : `'%%'`
  const voteHigh = req.query.voteHigh ? `${req.query.voteHigh}` : `'%%'`

  const directors = req.query.directors ? req.query.directors.split(",").map(director => `'%${director}%'`).join(' OR P.name LIKE ') : `'%%'`
  const cast = req.query.cast ? req.query.cast.split(",").map(member => `'%${member}%'`).join(' OR P.name LIKE ') : `'%%'`
  const keywords = req.query.keywords ? req.query.keywords.split(",").map(word => `'%${word}%'`).join(' OR keyword LIKE ') : `'%%'`
	const genres = req.query.genres ? req.query.genres.split(",").map(genre => `'%${genre}%'`).join(' OR genre LIKE ') : `'%%'`

	const castQuery = req.query.cast ? `
		Cast AS (
			SELECT C.movie_id
			FROM Cast_Of C JOIN Person P
			ON C.person_id = P.person_id
			WHERE P.name LIKE ${cast}
		), ` : ''
	const castJoin = req.query.cast ? `JOIN Cast C ON M.movie_id = C.movie_id` : ''

	const directorsQuery = req.query.directors ? `
		Directors AS (
			SELECT D.movie_id
			FROM Director_Of D JOIN Person P
			ON D.person_id = P.person_id
			WHERE P.name LIKE ${directors}
		), ` : ''
	const directorsJoin = req.query.directors ? `JOIN Directors D ON M.movie_id = D.movie_id` : ''

	const keywordsQuery = req.query.keywords ? `
		Keywords AS (
			SELECT movie_id
			FROM Keyword
			WHERE keyword LIKE ${keywords}
		), ` : ''
	const keywordsJoin = req.query.keywords ? `JOIN Keywords K ON M.movie_id = K.movie_id` : ''

	const genresQuery = req.query.genres ? `
		Genres AS (
			SELECT movie_id
			FROM Genre
			WHERE genre LIKE ${genres}
		), ` : ''
	const genresJoin = req.query.genres ? `JOIN Genres G ON M.movie_id = G.movie_id` : ''

	let withAs = [directorsQuery, castQuery, keywordsQuery, genresQuery].join("")
	withAs = withAs === '' ? '' : 'WITH ' + withAs.substring(0, withAs.length - 2)
	
	const query = `
    ${withAs}

    SELECT DISTINCT M.movie_id, title, poster_path
    FROM Movie M
    ${directorsJoin}
		${castJoin}
		${keywordsJoin}
		${genresJoin}
    WHERE title LIKE ${title} 
    AND runtime >= ${runtimeLow} AND runtime <= ${runtimeHigh} 
    AND release_year >= ${yearLow} AND release_year <= ${yearHigh}
    AND vote_average >= ${voteLow} AND vote_average <= ${voteHigh}
		LIMIT 20
  `
  await queryDB(query,res)
})

router.get('/headshot/:id', async (req, res) => {
  if (!req.params.id) return res.json({error: "Invalid id or no id specified."})
	const api_key='9f2e22366278dcc2b7bc241864f84be8'
	
	if (req.params.id.length > 7) {
		return res.json({ headshot: '' })
	}

	const headshotId = `nm${'0'.repeat(7-req.params.id.toString().length)}${req.params.id}`
	const url = `	https://api.themoviedb.org/3/find/${headshotId}?api_key=${api_key}&language=en-US&external_source=imdb_id`

  await request(url, {json: true}, (error, response, body) => {
    if (!error) {
			if (body.person_results && body.person_results[0] && body.person_results[0].profile_path) {
				return res.json({ headshot: body.person_results[0].profile_path})
			} else {
				return res.json({ headshot: '' })
			}
		} else {
			return res.json({ headshot: '' })
		}
  })
})

// gets most liked movies
router.get('/trending', async (req, res) => {
	const numRes = req.query.numRes

	const query = `
		WITH CountLikes AS (
			SELECT movie_id, COUNT(user_id) as num_likes
			FROM Liked_By
			WHERE liked = 1
			GROUP BY movie_id
		)
		SELECT M.title, M.movie_id, M.poster_path, C.num_likes
		FROM CountLikes C JOIN Movie M ON C.movie_id = M.movie_id 
		WHERE num_likes != 0
		ORDER BY num_likes DESC
		LIMIT ${numRes}
	`
	await queryDB(query, res)
})

// gets genres liked by the most number of distinct users
router.get('/trending/genre', async (req, res) => {
	const numGenres = req.query.numGenres
	const numMovies = req.query.numMovies

	const movies = req.query.getMovies === 'true' ? `
		, CountMovieLikes AS (
			SELECT movie_id, COUNT(user_id) as num_likes
			FROM Liked_By
			WHERE liked = 1
			GROUP BY movie_id
		)
		SELECT DISTINCT M.movie_id, M.title, M.poster_path, CM.num_likes
		FROM Genre G JOIN CountGenreLikes C ON G.genre = C.genre
			JOIN Movie M ON G.movie_id = M.movie_id
			JOIN CountMovieLikes CM ON M.movie_id = CM.movie_id
		ORDER BY CM.num_likes DESC
		LIMIT ${numMovies}
		` : `
		SELECT * 
		FROM CountGenreLikes
		`

	const query = `
		WITH GenresLiked AS (
			SELECT DISTINCT G.genre, L.user_id
			FROM Genre G JOIN Liked_By L ON G.movie_id = L.movie_id
			WHERE L.liked = 1
		), 
		CountGenreLikes AS (
			SELECT genre, COUNT(user_id) as num_likes
			FROM GenresLiked
			GROUP BY genre
			ORDER BY num_likes DESC, genre
			LIMIT ${numGenres}
		)
		${movies}
	`

	await queryDB(query, res)
})

router.get('/trending/keyword', async (req, res) => {
	const numKeywords = req.query.numKeywords
	const numMovies = req.query.numMovies

	const movies = req.query.getMovies === 'true' ? `
		, CountMovieLikes AS (
				SELECT movie_id, COUNT(user_id) as num_likes
				FROM Liked_By
				WHERE liked = 1
				GROUP BY movie_id
		)
		SELECT DISTINCT M.movie_id, M.title, M.poster_path, CM.num_likes
		FROM Keyword K JOIN CountKeywordLikes CK ON K.keyword = CK.keyword
				JOIN Movie M ON K.movie_id = M.movie_id
				JOIN CountMovieLikes CM ON M.movie_id = CM.movie_id
		ORDER BY CM.num_likes DESC
		LIMIT ${numMovies}
		` : `
		SELECT * 
		FROM CountKeywordLikes
		`

	const query = `
		WITH LikedKeywords AS (
			SELECT DISTINCT K.keyword, L.user_id
			FROM Liked_By L JOIN Keyword K ON L.movie_id = K.movie_id
			WHERE L.liked = 1
		),
		CountKeywordLikes AS (
				SELECT keyword, COUNT(*) as num_likes
				FROM LikedKeywords
				GROUP BY keyword
				ORDER BY num_likes DESC, keyword
				LIMIT ${numKeywords}
		)
		${movies}
	`

	await queryDB(query, res)
})

router.get('/trending/director', async (req, res) => {
	const numDirectors = req.query.numDirectors
	const numMovies = req.query.numMovies 

	const movies = req.query.getMovies === 'true' ? `
		, CountMovieLikes AS (
			SELECT movie_id, COUNT(user_id) as num_likes
			FROM Liked_By
			WHERE liked = 1
			GROUP BY movie_id
		)
		SELECT DISTINCT M.movie_id, M.title, M.poster_path, CM.num_likes
		FROM Director_Of D JOIN CountDirectorLikes CD ON D.person_id = CD.person_id
				JOIN Movie M ON D.movie_id = M.movie_id
				JOIN CountMovieLikes CM ON M.movie_id = CM.movie_id
		ORDER BY CM.num_likes DESC
		LIMIT ${numMovies}
		` : `
		SELECT * 
		FROM CountDirectorLikes
		`

	const query = `
		WITH LikedDirectors AS (
			SELECT DISTINCT L.movie_id, D.person_id, L.user_id
			FROM Director_Of D JOIN Liked_By L on D.movie_id = L.movie_id
			WHERE L.liked = 1
		),
		CountDirectorLikes AS (
				SELECT L.person_id, P.name, COUNT(*) as num_likes
				FROM LikedDirectors L JOIN Person P ON L.person_id = P.person_id
				GROUP BY L.person_id
				ORDER BY num_likes DESC, P.name
				LIMIT ${numDirectors}
		)
		${movies}
	`

	await queryDB(query, res)
})

router.get('/random', async (req, res) => {
	const num_res = req.query.num_res ? req.query.num_res : 20

	const query = `
		SELECT title, movie_id, poster_path FROM Movie
		ORDER BY RAND ( )
		LIMIT ${num_res}
	`
	await queryDB(query, res)
})

router.get('/findtmdb/:id', async (req, res) => {
  if (!req.params.id) return res.json({error: "Invalid id or no id specified."})
	const api_key='9f2e22366278dcc2b7bc241864f84be8'
	
	if (req.params.id.length > 7) {
		return res.json({ results: '' })
	}

	const movieId = `tt${'0'.repeat(7-req.params.id.toString().length)}${req.params.id}`
	const find_url = `	https://api.themoviedb.org/3/find/${movieId}?api_key=${api_key}&language=en-US&external_source=imdb_id`

	await request(find_url, {json: true}, (error, response, body) => {
    if (!error) {
			if (!body || !body.movie_results || !body.movie_results[0] || !body.movie_results[0].id) {
				return res.json({})
			} else {
				return res.json({ tmdb_id: body.movie_results[0].id })
			}
		}
  })
})

router.get('/streaming/:id', async (req, res) => {
  if (!req.params.id) return res.json({error: "Invalid id or no id specified."})
	const api_key='9f2e22366278dcc2b7bc241864f84be8'

	if (req.params.id.length > 7) {
		return res.json({ results: '' })
	}

	const movieId = `tt${'0'.repeat(7-req.params.id.toString().length)}${req.params.id}`
	const url = `https://api.themoviedb.org/3/movie/${req.params.id}/watch/providers?api_key=${api_key}`

	await request(url, {json: true}, (error, response, body) => {
    if (!error) {
			if (!body || !body.results || !body.results.US || !body.results.US.flatrate) {
				return res.json({})
			} else {
				return res.json({ providers: body.results.US.flatrate })
			}
		}
  })
})

router.get('/:id', async (req, res) => {
  if (!req.params.id) return res.json({error: "Invalid id or no id specified."})
	
	const query = `
		WITH Genres AS (
			SELECT GROUP_CONCAT(genre SEPARATOR ', ') AS genres, movie_id
			FROM Genre
			WHERE movie_id=${req.params.id}
			GROUP BY movie_id
		), Directors AS (
				SELECT GROUP_CONCAT(name SEPARATOR ', ') AS directors, movie_id
				FROM Director_Of D JOIN Person P
				ON D.person_id = P.person_id
				WHERE movie_id=${req.params.id}
				GROUP BY movie_id
		), Cast AS (
				SELECT GROUP_CONCAT(C.person_id SEPARATOR ', ') AS cast_ids,  GROUP_CONCAT(name SEPARATOR ', ') AS cast_names, movie_id
				FROM Cast_Of C JOIN Person P
				ON C.person_id = P.person_id
				WHERE movie_id=${req.params.id}
				GROUP BY movie_id
		), Keywords AS (
				SELECT GROUP_CONCAT(keyword SEPARATOR ', ') AS keywords, movie_id
				FROM Keyword
				WHERE movie_id=${req.params.id}
				GROUP BY movie_id
		)

		SELECT M.movie_id, poster_path, title, runtime, release_year, language, overview, tagline, vote_average, genres, directors, cast_ids, cast_names, keywords
		FROM Movie M JOIN Genres G ON M.movie_id = G.movie_id
		LEFT JOIN Directors D ON M.movie_id = D.movie_id
		LEFT JOIN Cast C ON M.movie_id = C.movie_id
		LEFT JOIN Keywords K ON M.movie_id = K.movie_id
	`
	await queryDB(query,res)
})

module.exports = router
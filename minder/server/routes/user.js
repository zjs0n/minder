const config = require('../config.json')
const mysql = require('mysql')

const express = require('express')
const router = express.Router()

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

// all of these routes should eventually use session 

router.get('/liked', async (req, res) => {
  if (!req.query.id) return res.json({error: "Invalid id or no id specified."})
	// replace req.params.user with req.session.user_id DONE
	const query = `SELECT * FROM Liked_By WHERE user_id = ${req.query.id} AND liked = 1`
	await queryDB(query,res)
})

router.post('/addpreference', async (req, res) => {
	console.log(req)
	if (!req.body.id) return res.json({error: "Invalid id or no id specified."})
  // replace req.params.user with req.session.user_id DONE
  const query = `
    INSERT INTO Liked_By(user_id, movie_id, liked)
    VALUES (${req.query.id}, ${req.body.id}, ${req.body.pref})
  `
	await queryDB(query,res)
})

router.get('/recommend', async (req, res) => {
  if (!req.query.id) return res.json({error: "Invalid id or no id specified."})
	
	const query = `
    WITH Liked_Movies AS (
        SELECT movie_id
        FROM Liked_By
        WHERE user_id=${req.query.id} AND liked=1
        ORDER BY RAND()
        LIMIT 100
    ), Genres_Matched AS (
        SELECT m.movie_id, COUNT(*) AS num
        FROM Movie m JOIN Genre g1 ON m.movie_id=g1.movie_id
                     JOIN Genre g2 ON g1.genre=g2.genre
                     JOIN Liked_Movies lm ON g2.movie_id=lm.movie_id
        GROUP BY movie_id
    ), Keywords_Matched AS (
        SELECT m.movie_id, COUNT(*) AS num
        FROM Movie m JOIN Keyword k1 ON m.movie_id=k1.movie_id
                     JOIN Keyword k2 ON k1.keyword=k2.keyword
                     JOIN Liked_Movies lm ON k2.movie_id=lm.movie_id
        GROUP BY movie_id
    ), Directors_Matched AS (
        SELECT m.movie_id, COUNT(*) AS num
        FROM Movie m JOIN Director_Of d1 ON m.movie_id=d1.movie_id
                     JOIN Director_Of d2 ON d1.person_id=d2.person_id
                     JOIN Liked_Movies lm ON d2.movie_id=lm.movie_id
        GROUP BY movie_id
    ), Cast_Matched AS (
        SELECT m.movie_id, COUNT(*) AS num
        FROM Movie m JOIN Cast_Of c1 ON m.movie_id=c1.movie_id
                     JOIN Cast_Of c2 ON c1.person_id=c2.person_id
                     JOIN Liked_Movies lm ON c2.movie_id=lm.movie_id
        GROUP BY movie_id
    ), Year_Matched AS (
        SELECT m.movie_id, COUNT(*) AS num
        FROM Movie m JOIN Movie m1 ON m.movie_id=m1.movie_id
                     JOIN Movie m2 ON ABS(m1.release_year - m2.release_year) < 3
                     JOIN Liked_Movies lm ON m2.movie_id=lm.movie_id
        GROUP BY movie_id
    ), Max_Genre AS (
        SELECT MAX(num) FROM Genres_Matched
    ), Max_Keyword AS (
        SELECT MAX(num) FROM Keywords_Matched
    ), Max_Director AS (
        SELECT MAX(num) FROM Directors_Matched
    ), Max_Cast AS (
        SELECT MAX(num) FROM Cast_Matched
    ), Max_Year AS (
        SELECT MAX(num) FROM Year_Matched
    )
    SELECT m.title, m.movie_id, m.poster_path
    FROM Movie m LEFT OUTER JOIN Genres_Matched gm ON m.movie_id=gm.movie_id
                 LEFT OUTER JOIN Keywords_Matched km ON m.movie_id=km.movie_id
                 LEFT OUTER JOIN Directors_Matched dm ON m.movie_id=dm.movie_id
                 LEFT OUTER JOIN Cast_Matched cm ON m.movie_id=cm.movie_id
                 LEFT OUTER JOIN Year_Matched ym ON m.movie_id=ym.movie_id
    WHERE NOT EXISTS (SELECT * FROM Liked_By l WHERE m.movie_id=l.movie_id AND user_id=${req.query.id})
    ORDER BY (
        1 * COALESCE(gm.num / (SELECT * FROM Max_Genre), 0) +
        1 * COALESCE(km.num / (SELECT * FROM Max_Keyword), 0) +
        1 * COALESCE(dm.num / (SELECT * FROM Max_Director), 0) +
        1 * COALESCE(cm.num / (SELECT * FROM Max_Cast), 0) +
        1 * COALESCE(ym.num / (SELECT * FROM Max_Year), 0)
    ) DESC
    LIMIT ${req.query.num_res ?? 1};
  `
	await queryDB(query,res)
})

module.exports = router

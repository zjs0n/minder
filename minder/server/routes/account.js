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

const queryDB = (query, res) => {
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log(error)
			res.json({ error: error })
		} else if (results) {
			res.json({ results: results })
		}
	})
}
let placeholder;
router.post('/signup', async (req, res) => {
  // finish error checking
  // replace req.params.user with req.session.user_id

  // TODO - have to check that username doesn't already exist; check if any fields are empty or null
  console.log('backend checker')
  console.log(req.body);
  console.log(req.body.f_name);
  console.log(req.body.l_name)
  console.log(req.body.u_name)
  console.log(req.body.pwd)
  if (!req.body.f_name || !req.body.l_name || !req.body.u_name || !req.body.pwd) return res.json({error: "Invalid id or no id specified."})
  else {const query1 = `SELECT MAX(user_id) AS num FROM User`
  connection.query(query1, function (error, results1, fields) {
    console.log('first check', results1)
    console.log('results1 is', results1[0])
    console.log(typeof (results1[0].num))
    if (error) {
      res.json({ error: error })
    } else {
      // finish error checking
      const query3 = `
      SELECT user_id
      FROM User
      WHERE u_name = '${req.body.u_name}'
      `
      connection.query(query3, function (error, results3, fields) {
        if (error) {
          res.json({ error: error })
        } else if (results3) {
          if (JSON.stringify(results3) != '[]') {return res.json({error: 'username has been taken! Please use something else'});}
          else if (JSON.stringify(results3) === '[]') {
            const query2 = `
            INSERT INTO User(user_id, f_name, l_name, u_name, pwd)
            VALUES (${results1[0].num + 1}, '${req.body.f_name}', '${req.body.l_name}', '${req.body.u_name}', '${req.body.pwd}')
          `
          connection.query(query2, function (error, results2, fields) {
            console.log('results2', results2)
            if (error) {
              res.json({ error: error })
            } else if (results2) {
              console.log("SIGN UP SUCCESS")
              res.json({ results: results2 })
            }
          })
          req.session.username = results1[0].num + 1;
          req.session.firstName = req.body.f_name;
          req.session.lastName = req.body.l_name;
          console.log(req.session)
          placeholder = req.session.username
          console.log('username from account backend is', req.session.username);
          // res.json({results: ''})
          }
        }
      })
    }
  })
}
})
router.get('/checklogin', async (req, res) => {
  console.log('check login')
  console.log(req.session)
  // const { username } = req.session;
  const username = {username: placeholder};
  console.log('checklogin backend', username, req.session.username)
  res.send(username);
})
router.post('/login', async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (!req.body.u_name || !req.body.pwd)return res.json({error: "Invalid id or no id specified."})
  const query = `
  SELECT user_id
  FROM User
  WHERE u_name = '${req.body.u_name}' AND pwd = '${req.body.pwd}'
  `
  // await queryDB(query,res).then(console.log("login backend checker", res))
  connection.query(query, function (error, results, fields) {
		if (error) {
			console.log(error)
			res.json({ error: error })
		} else if (results) {
      console.log('backend login checker', JSON.stringify(results), typeof(JSON.stringify(results)))
      if (JSON.stringify(results) === '[]') {return res.json({error:'empty result'})}
      else if (results != [] && results[0].user_id > -2) {
        req.session.username = results[0].user_id
        // console.log('login session check')
        // console.log(req.session.username)
        console.log(req.session)
        console.log(typeof (req.session.username))
        placeholder = req.session.username
        console.log('placeholder', placeholder)
        res.json({results: results})
        // const query2 = `
        // SELECT user_id
        // FROM User
        // WHERE u_name = '${req.session.username}
        // `
        // connection.query(query2, function (error, results2, fields) {
        //   console.log('results2', results2);
        //   if (error) {
        //     res.json({ error: error })
        //   } else if (results2) {
        //     res.json({ results: results2 })
        //   }
        // })
      } 
		}
	})
  
  // res.json({})
})

router.post('/logout', async (req, res) => {
  req.session.destroy()
  placeholder = ''
  res.json({msg: 'logout success'})
})

module.exports = router
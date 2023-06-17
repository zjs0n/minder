import config from './config.json'

const getMovieInfo = async id => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/${id}`, {
        method: 'GET',
    })
  return res.json()
}

const getHeadshot = async (id) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/headshot/${id}`, {
        method: 'GET',
    })
  return res.json()
}

const getStreamingServices = async (id) => {
  var res1 = await fetch(`http://${config.server_host}:${config.server_port}/movie/findtmdb/${id}`, {
        method: 'GET',
    })
  const { tmdb_id } = await res1.json()
  var res2 = await fetch(`http://${config.server_host}:${config.server_port}/movie/streaming/${tmdb_id}`, {
      method: 'GET',
  })
  return res2.json()
}

const signupUser = async (u_name, pwd, f_name, l_name) => {
  console.log('inside fetcher check', u_name)
  console.log(u_name, pwd, f_name, l_name)
  var res = await fetch(`http://${config.server_host}:${config.server_port}/account/signup`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({u_name, pwd, f_name, l_name}),
    })
  return res.json()
}

const loginUser = async (u_name, pwd) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/account/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({u_name, pwd})
    })
  return res.json()
}

const checkLogin = async () => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/account/checklogin`, {
        method: 'GET',
        credentials: 'include'
  })
  // .then((res) => {return res.json()} )
  // .then((json) => console.log('data is', json));

  console.log('fetcher checklogin')
  return res.json()
  // console.log(res.json);
  // return res.json()
}
const logoutUser = async () => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/account/logout`, {
        method: 'POST',
        credentials: 'include'
    })
  return res.json()
}

const getLikes = async (username) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/user/liked?id=${username}`, {
        method: 'GET',
    })
  return res.json()
}

const addPreference = async (username, movie_id, pref) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/user/addpreference?id=${username}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: -1,
      id: movie_id,
      pref: pref
    })
  })
  console.log(movie_id)
  return res.json()
}

const search = async (title, runtimeLow, runtimeHigh, yearLow, yearHigh, voteLow, voteHigh, directors, cast, genres, keywords) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/search?title=${title}&runtimeLow=${runtimeLow}&runtimeHigh=${runtimeHigh}&yearLow=${yearLow}&yearHigh=${yearHigh}&voteLow=${voteLow}&voteHigh=${voteHigh}&directors=${directors.join(",")}&cast=${cast.join(",")}&genres=${genres.join(",")}&keywords=${keywords.join(",")}`, {
        method: 'GET',
    })
  return res.json()
}

const getRandom = async (num_res) => {
  const numResQuery = num_res ? `?num_res=${num_res}` : "";
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/random${numResQuery}`, {
        method: 'GET',
    })
  return res.json()
}

const getTrendingMovies = async (numRes) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/trending?numRes=${numRes}`, {
    method: 'GET',
  })
  return res.json()
}

const getTrendingGenres = async (numGenres, numMovies, getMovies) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/trending/genre?numGenres=${numGenres}&numMovies=${numMovies}&getMovies=${getMovies}`, {
    method: 'GET',
  })
  return res.json()
}

const getTrendingKeywords = async (numKeywords, numMovies, getMovies) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/trending/keyword?numKeywords=${numKeywords}&numMovies=${numMovies}&getMovies=${getMovies}`, {
    method: 'GET',
  })
  return res.json()
}

const getTrendingDirectors = async (numDirectors, numMovies, getMovies) => {
  var res = await fetch(`http://${config.server_host}:${config.server_port}/movie/trending/director?numDirectors=${numDirectors}&numMovies=${numMovies}&getMovies=${getMovies}`, {
    method: 'GET',
  })
  return res.json()
}

const getRecommended = async (username, num_res) => {
  const numResQuery = num_res ? `&num_res=${num_res}` : "";
  var res = await fetch(`http://${config.server_host}:${config.server_port}/user/recommend?id=${username}${numResQuery}`, {
    method: 'GET',
  })
  return res.json()
}

export {
  getMovieInfo,
  getHeadshot,
  getStreamingServices,
  signupUser,
  loginUser,
  checkLogin,
  logoutUser,
  getLikes,
  addPreference,
  search,
  getRandom,
  getTrendingMovies,
  getTrendingGenres,
  getTrendingKeywords,
  getTrendingDirectors,
  getRecommended
}
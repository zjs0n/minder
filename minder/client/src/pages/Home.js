import { React, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

import ResultCard from '../components/ResultCard'
import { getTrendingMovies, getTrendingGenres, getTrendingKeywords, getTrendingDirectors, checkLogin } from '../fetcher'

const Home = () => {
  const [movies, setMovies] = useState([])
  const [trendingText, setTrendingText] = useState([])
  const [numMovies, setNumMovies] = useState(50)
  const [numText, setNumText] = useState(5)
  const [dispType, setDispType] = useState('Movies')
  const [username, setUsername] = useState('')

  useEffect(() => {
    checkLogin()
      .then((res) => {
        if (res !== '') {
          console.log('home recieved check')
          console.log(res);
          setUsername(res.username);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  console.log(username)
  console.log(typeof (username));
  useEffect(() => {
    let loadTrending = null
    switch(dispType) {
      case 'Movies':
        loadTrending = async () => {
          const { results } = await getTrendingMovies(numMovies)
          setMovies(results)
        }
        break
      case 'Genres':
        loadTrending = async () => {
          const { results } = await getTrendingGenres(numText, numMovies, "false")
          setTrendingText(results)
          const movieData = await getTrendingGenres(numText, numMovies, "true")
          setMovies(movieData.results)
        }
        break
      case 'Keywords':
        loadTrending = async() => {
          const { results } = await getTrendingKeywords(numText, numMovies, "false")
          setTrendingText(results)
          const movieData = await getTrendingKeywords(numText, numMovies, "true")
          setMovies(movieData.results)
        }
        break
      case 'Directors':
        loadTrending = async() => {
          const { results } = await getTrendingDirectors(numText, numMovies, "false")
          setTrendingText(results)
          const movieData = await getTrendingDirectors(numText, numMovies, "true")
          setMovies(movieData.results)
        }
        break
      default:
        loadTrending = async () => {
          const { results } = await getTrendingMovies(numMovies)
          setMovies(results)
        }
        break
    }

    loadTrending()
    
  }, [numMovies, numText, dispType])

  let id = 0

  return (
    <>
      {<div className="w-full h-screen grid grid-cols-6">
        <Navbar />
        <div className="col-span-5 h-screen overflow-y-scroll scroll-div"> 
          <div className="w-full p-12">
            <h1 className="font-black text-4xl">Trending {dispType}</h1>
            <div className="hover:text-pink transition duration-200 my-3">
                <p className="font-bold">Display Different Trending Data</p>
                <select name="type" onChange={e => setDispType(e.target.value)} className="w-28 p-2 bg-white rounded-lg my-2 text-dark-navy">
                  <option value="Movies">Movies</option>
                  <option value="Genres">Genres</option>
                  <option value="Keywords">Keywords</option>
                  <option value="Directors">Directors</option>
                </select>
            </div>

            {(dispType === 'Movies') 
            ?  (<>
                  <div className="hover:text-pink transition duration-200">
                    <p className="font-bold">Number of Movies to Display</p>
                    <input type="number" value={numMovies} min="1" max="100" onChange={e => setNumMovies(e.target.value)} className="w-16 p-2 bg-white rounded-lg my-2 text-dark-navy"/>
                  </div>
                  <div className="grid grid-cols-4 gap-8 my-8">
                    {movies.map(movie => 
                      <ResultCard key={movie.movie_id} id={movie.movie_id} title={movie.title} url={movie.poster_path} numLikes={movie.num_likes}/>
                    )}
                  </div>
                </>)
            : ( <>
                  <div className="w-full flex">
                    <div className="hover:text-pink transition duration-200">
                      <p className="font-bold">Number of {dispType} to Display</p>
                      <input type="number" value={numText} min="1" max="26" onChange={e => setNumText(e.target.value)} className="w-16 p-2 bg-white rounded-lg my-2 text-dark-navy"/>
                    </div>
                    <div className="ml-5 hover:text-pink transition duration-200">
                      <p className="font-bold">Number of Movies to Display</p>
                      <input type="number" value={numMovies} min="1" max="100" onChange={e => setNumMovies(e.target.value)} className="w-16 p-2 bg-white rounded-lg my-2 text-dark-navy"/>
                    </div>
                  </div>
                  <p className="font-bold mt-5">Top {numText} Trending {dispType}</p>
                  <div className="w-full flex">
                    {trendingText.map(text => 
                      <p key={id++} className="p-2 mr-3 mt-1 rounded-lg bg-dark-navy cursor-default">
                        {
                          {
                          'Genres': text.genre,
                          'Keywords': text.keyword,
                          'Directors': text.name,
                          }[dispType]}
                      </p>
                      )}
                  </div>
                  <p className="font-bold mt-5">Most Popular Movies With Trending {dispType}</p>
                  <div className="grid grid-cols-4 gap-8 my-8">
                    {movies.map(movie => 
                      <ResultCard key={movie.movie_id} id={movie.movie_id} title={movie.title} url={movie.poster_path} numLikes={movie.num_likes}/>
                    )}
                  </div> 
                </>)}
          </div>
        </div>
      </div>}
    </>
  )
}

export default Home

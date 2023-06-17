import React, { useState, useEffect } from 'react'

import Navbar from '../components/Navbar'
import ResultCard from '../components/ResultCard'
import '../styles/Scroll.css'
import { getLikes, getMovieInfo, checkLogin } from '../fetcher'
import { useNavigate } from 'react-router-dom';

const Liked = () => {
  const [likedMoviesInfo, setLikedMoviesInfo] = useState()
  const [username, setUsername] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    checkLogin()
      .then((res) => {
        if (res !== '') {
          console.log('home recieved check')
          console.log(res);
          setUsername(res.username);
        } else {
          navigate('/')
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  console.log(username)

  useEffect(() => {
    if (username) {
      getLikes(username).then(likedMoviesRes => Promise.all(
        likedMoviesRes.results.map(movie => getMovieInfo(movie.movie_id).then(
            movieInfoRes => movieInfoRes.results[0]
          )
        ))).then(
        moviesInfoRes => setLikedMoviesInfo(moviesInfoRes)
      )
    }
    console.log('second use effect', username)
    // getLikes(username).then(likedMoviesRes => Promise.all(
    //   likedMoviesRes.results.map(movie => getMovieInfo(movie.movie_id).then(
    //       movieInfoRes => movieInfoRes.results[0]
    //     )
    //   ))).then(
    //   moviesInfoRes => setLikedMoviesInfo(moviesInfoRes)
    // )
  }, [username]);

  return (
    <>
      <div className="w-full h-screen grid grid-cols-6">
        <Navbar />
        <div className="col-span-5 h-screen overflow-y-scroll scroll-div">
          <div className="w-full p-12">
            <h1 className="font-black text-4xl">Liked Movies</h1>
            <div className="grid grid-cols-4 gap-8 my-8">
              {likedMoviesInfo ? likedMoviesInfo.map(movie =>
                <ResultCard id={movie.movie_id} title={movie.title} url={movie.poster_path} key={movie.movie_id} />
              ) : <div className="font-black text-2xl">Loading...</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Liked

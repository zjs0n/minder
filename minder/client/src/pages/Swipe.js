import React, { useState, useEffect, useMemo, useRef } from 'react'
import TinderCard from 'react-tinder-card'
import Navbar from '../components/Navbar'
import SwipeCard from '../components/SwipeCard'
import { X, Heart } from 'react-feather'
import { addPreference, getRandom, getRecommended, checkLogin } from '../fetcher'

const Swipe = () => {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [movies, setMovies] = useState([])
  const stackSize = 5
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

  const populateRandom = (num) => {
    getRandom(num).then(res => {
      if (res.results) {
        setMovies(res.results.reverse())
      }
    })
  }

  const populateRecommended = (num) => {
    console.log(`recUsername: ${username}`)
    getRecommended(username, num).then(res => {
      if (res.results) {
        console.log(`recUsername: ${username}`)
        setMovies(res.results.reverse())
      }
    })
  }

  const populate = () => {
    if (Math.random() > 0.2) {
      populateRecommended(stackSize)
    } else {
      populateRandom(stackSize)
    }
    console.log(childRefs)
  }

  useEffect(() => {
    console.log(`username: ${username}`)
    console.log(`currentIndex: ${currentIndex}`)
    if (currentIndex === -1) {
      populate()
    }
  }, [currentIndex, username])

  useEffect(() => {
    console.log(movies)
    console.log(childRefs)
    for (let i = childRefs.length - 1; i >= 0; i--) {
      if (childRefs[i].current) {
        childRefs[i].current.restoreCard()
      }
    }
    setTimeout(function() {
      setCurrentIndex((prev) => Math.min(prev + movies.length, movies.length - 1))
    },  200)
  }, [movies])

  const childRefs = useMemo(
    () =>
      Array(stackSize)
        .fill(0)
        .map((i) => React.createRef()),
    []
  )

  const addToDisliked = movie_id => {
    addPreference(username, movie_id, 0)
  }

  const addToLiked = movie_id => {
    addPreference(username, movie_id, 1)
  }

  const swiped = (direction, movieId, index) => {
    setCurrentIndex((prevState) => prevState - 1)
    if (direction === 'left') {
      addToDisliked(movieId)
    } else {
      addToLiked(movieId)
    }
  }

  const swipe = async (dir) => {
    if (childRefs[currentIndex] && childRefs[currentIndex].current && currentIndex >= 0) {
      await childRefs[currentIndex].current.swipe(dir)
    }
  }

  return (
    <>
      <div className="w-full h-full grid grid-cols-6">
        <Navbar />
        <div className="col-span-5 flex items-center justify-center grid grid-cols-5">
          <div></div>
          <div className="col-span-3 h-full flex flex-col justify-center">
            <div className="h-2/3">
              <div className="cardContainer h-full relative flex items-center justify-center">
                <div className="font-bold text-2xl">Loading...</div>
                {movies.map((movie, i) =>
                  <TinderCard className='swipe absolute w-full h-full' ref={childRefs[i]} key={movie.title} onSwipe={(dir) => swiped(dir, movie.movie_id, i)}>
                    <SwipeCard className="card w-full h-full"
                      title={movie.title}
                      image={movie.poster_path}
                      id={movie.movie_id}
                    />
                  </TinderCard>
                )}
              </div>
              <div className="block h-1/5 flex justify-center">
                <button
                  onClick={() => swipe('left')}
                  className="mr-4"
                >
                  <X strokeWidth={5} className="hover:stroke-pink transition duration-200"/>
                </button>
                <button
                  onClick={() => swipe('right')}
                  className="ml-4"
                >
                  <Heart className="fill-pink stroke-0 hover:fill-white transition duration-200"/>
                </button>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </>
  )
}

export default Swipe

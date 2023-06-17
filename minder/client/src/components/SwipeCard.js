import React, { useEffect, useState } from 'react'
import { useNavigate, generatePath, createSearchParams } from 'react-router-dom'
import { getMovieInfo } from '../fetcher'
import '../styles/Scroll.css'

const SwipeCard = ({ image, title, id }) => {
  const params = { id }
  const [genre, setGenre] = useState(undefined)
  const [releaseYear, setReleaseYear] = useState(undefined)
  const [directors, setDirectors] = useState(undefined)
  const [cast, setCast] = useState(undefined)
  const [overview, setOverview] = useState(undefined)

  const navigate = useNavigate()

  const goToMovie = () => {
    const path = generatePath(':url?:queryString', {
      url: '/movie',
      queryString: createSearchParams(params).toString(),
    })
    navigate(path)
  }

  useEffect(() => {
    getMovieInfo(id).then(res => {
      const movie = res.results[0];
      setGenre(movie.genres)
      setReleaseYear(movie.release_year)
      setDirectors(movie.directors)
      setCast(movie.cast_names)
      setOverview(movie.overview)
    })
  }, [])

  return (
      <div className="bg-dark-navy w-full h-full rounded-2xl p-8">
        <div className="h-full grid grid-cols-2 gap-8">
          <div className="w-full h-full">
            <div className={`rounded-xl w-full h-full bg-[url('${image}')] bg-cover bg-center bg-no-repeat`}/>
          </div>
          <div className="flex flex-col justify-start overflow-scroll scroll-div">
            <div>
              <h2 className="font-black text-3xl cursor-pointer" onClick={() => goToMovie()}>{title}</h2>
              {genre && <p><span className="font-bold">Genre: </span>{genre}</p>}
              {releaseYear && <p><span className="font-bold">Release Year: </span>{releaseYear}</p>}
            </div>
            {directors && (
              <div className="my-4">
                <h2 className="font-black text-2xl cursor-pointer">Director</h2>
                <p>{directors}</p>
              </div>
            )}
            {cast && (
              <div className="my-2">
                <h2 className="font-black text-2xl cursor-pointer">Lead Cast</h2>
                <p>{cast}</p>
              </div>
            )}
            {overview && (
              <div className="my-2">
                <h2 className="font-black text-2xl cursor-pointer">Overview</h2>
                <p>{overview}</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

export default SwipeCard

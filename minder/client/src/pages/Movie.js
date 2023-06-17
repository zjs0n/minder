import { React, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaImdb } from 'react-icons/fa'
import { getMovieInfo, getHeadshot, getStreamingServices } from '../fetcher'
import Navbar from '../components/Navbar'
import ISO6391 from 'iso-639-1'

const Movie = () => {
  const [searchParams] = useSearchParams()
  const id = parseInt(searchParams.get('id'))
  const [movie, setMovie] = useState({})

  useEffect(() => {
    const loadMovieInfo = async () => {
      const { results } = await getMovieInfo(id)
      let movieInfo = results[0]

      const cast_ids = movieInfo.cast_ids.split(", ")
      const cast_names = movieInfo.cast_names.split(", ")
      const cast = []

      for (let i = 0; i < cast_ids.length; i++) {
        const cast_id = cast_ids[i]
        const name = cast_names[i]
        const { headshot } = await getHeadshot(cast_id)
        cast.push({ cast_id, headshot, name })
      }

      movieInfo = {...movieInfo, cast}

      const providersRes = await getStreamingServices(id)
      if (providersRes && providersRes.providers) {
        const streamingServices = []
        providersRes.providers.map(service => {
          streamingServices.push({ name:service.provider_name })
        })
        movieInfo = {...movieInfo, streamingServices}
      }
      setMovie(movieInfo)
    }
    loadMovieInfo()
  }, [])

  return (
    <>
      <div className="w-full h-screen grid grid-cols-6">
        <Navbar />
        <div className="col-span-5 h-screen grid grid-cols-3 m-16"> 
          <div className="col-span-1">
            <div className={`w-full h-3/5 bg-[url(${movie.poster_path})] bg-no-repeat bg-cover bg-center rounded-lg`}></div>
          </div>
          <div className="col-span-2 mx-8">
            <h1 className="font-bold text-4xl">{movie.title}</h1>
            {movie.tagline && <p className="mt-2 mb-8">{movie.tagline}</p>}
            <div className="flex justify-between my-2">
              <p>{movie.release_year}</p>
              <p>{movie.genres}</p>
              <p>{movie.runtime} min</p>
              <div className="flex items-center"><span className="mr-2"><FaImdb /></span> {movie.vote_average}</div>
            </div>
            <div className="mt-8 mb-4">
              <table>
                <tbody>
                  <tr>
                    <td><p className="mr-4 font-bold">Director</p></td>
                    <td>{movie.directors}</td>
                  </tr>
                  <tr>
                    <td><p className="mr-4 font-bold">Language</p></td>
                    <td>{movie.language ? ISO6391.getName(movie.language) : ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full my-8">
              <h3 className="font-bold">Cast</h3>
              <div className="w-full grid grid-cols-4 gap-8 my-2">
                {movie.cast && movie.cast.map(member => (
                  <div className="w-full flex flex-col items-center" key={member.cast_id} >
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${member.headshot}`} 
                      alt={member.name} 
                      className="object-cover h-[64px] w-[64px] rounded-full"
                    />
                    <p className="text-center text-xs my-2">{member.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 mb-4">
              <p>{movie.overview}</p>
            </div>
            <div className="mt-8 mb-4">
              <h4 className="font-bold my-2">Related keywords</h4>
              <p className="text-xs">{movie.keywords}</p>
            </div>
            {(movie.streamingServices && movie.streamingServices.length > 0) && (
              <div className="mt-8 mb-4">
                <h4 className="font-bold my-2">Watch on</h4>
                <div className="flex">
                  {movie.streamingServices.map(service => (
                    <div key={service.provider_id} className="mr-8">
                      <p>{service.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Movie

import { React, useState, useEffect } from 'react'
import { Slider } from '@mui/material'
import TagsInput from 'react-tagsinput'
import { ChevronDown, ChevronRight } from 'react-feather'

import { search, getRandom } from '../fetcher'
import Navbar from '../components/Navbar'
import ResultCard from '../components/ResultCard'
import '../styles/Scroll.css'
import '../styles/TagsInput.css'

const Browse = () => {
  const [results, setResults] = useState([])

  const [advancedOn, setAdvancedOn] = useState(false)
  const [title, setTitle] = useState('')
  const [cast, setCast] = useState([])
  const [directors, setDirectors] = useState([])
  const [genres, setGenres] = useState([])
  const [keywords, setKeywords] = useState([])

  const [runtime, setRuntime] = useState([1, 300])
  const [year, setYear] = useState([1896, 2029])
  const [rating, setRating] = useState([0, 10])

  const handleSubmit = async e => {
    e.preventDefault()
    e.stopPropagation()
  
    const runtimeLow = runtime[0]
    const runtimeHigh = runtime[1]
    const yearLow = year[0]
    const yearHigh = year[1]
    const voteLow = rating[0]
    const voteHigh = rating[1]

    console.log(genres)
    console.log(keywords)

    const { results:searchResults } = await search(
      title, runtimeLow, runtimeHigh, yearLow, yearHigh, voteLow, voteHigh, directors, cast, genres, keywords
    )

    setResults(searchResults)
  }

  useEffect(() => console.log(results), [results])

  useEffect(() => {
    const getRandomMovies = async () => {
      const { results:randomResults } = await getRandom()
      setResults(randomResults)
    }
    getRandomMovies()
  }, [])

  return (
    <>
      <div className="w-full h-screen grid grid-cols-6">
        <Navbar />
        <div className="col-span-5 h-screen overflow-y-scroll scroll-div"> 
          <div className="w-full p-12">
            <h1 className="font-black text-4xl">Browse Movies</h1>
            <div>
              <form onSubmit={handleSubmit}>
                <div className="w-full flex my-4 items-start">
                  <button 
                    className="flex-none mr-4 p-2 rounded-lg bg-dark-navy hover:bg-pink transition duration-200"
                    onClick={() => setAdvancedOn(!advancedOn)}
                    type="button"
                  >
                    {!advancedOn && <ChevronDown />}
                    {advancedOn && <ChevronRight />}
                  </button>
                  <input 
                    className="grow w-full p-2 rounded-lg bg-medium-navy box-border border border-medium-navy focus:bg-white focus:border-pink focus:outline-none transition duration-200" 
                    placeholder="Search titles..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  <button type="submit" className="flex-none ml-4 p-2 rounded-lg bg-dark-navy hover:bg-pink transition duration-200">Search</button>
                </div>
                {advancedOn && (
                  <>
                    <div className="w-full grid grid-cols-2 gap-12 my-4">
                      <div className="hover:text-pink transition duration-200">
                        <p className="font-bold">Cast</p>
                        <div className="p-2 bg-white rounded-lg my-2">
                          <TagsInput value={cast} onChange={tags => setCast(tags)} />
                        </div>
                      </div>
                      <div className="hover:text-pink transition duration-200">
                        <p className="font-bold">Directors</p>
                        <div className="p-2 bg-white rounded-lg my-2">
                          <TagsInput value={directors} onChange={tags => setDirectors(tags)} />
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex">
                      <div className="w-full grid grid-cols-3 gap-12 grow">
                        <div className="hover:text-pink transition duration-200">
                          <p className="font-bold">Runtime</p>
                          <Slider getAriaLabel={() => 'Runtime'} min={1} max={300} size="small" value={runtime} onChange={(e, val) => setRuntime(val)} valueLabelDisplay="auto" color="secondary" />
                        </div>
                        <div className="hover:text-pink transition duration-200">
                          <p className="font-bold">Release Year</p>
                          <Slider getAriaLabel={() => 'Release Year'} min={1896} max={2029} size="small" value={year} onChange={(e, val) => setYear(val)} valueLabelDisplay="auto" color="secondary" />
                        </div>
                        <div className="hover:text-pink transition duration-200">
                          <p className="font-bold">Rating</p>
                          <Slider getAriaLabel={() => 'Rating'} min={0} max={10} size="small" value={rating} onChange={(e, val) => setRating(val)} valueLabelDisplay="auto" color="secondary" />
                        </div>
                      </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-12 my-4">
                      <div className="hover:text-pink transition duration-200">
                        <p className="font-bold">Genres</p>
                        <div className="p-2 bg-white rounded-lg my-2">
                          <TagsInput value={genres} onChange={tags => setGenres(tags)} />
                        </div>
                      </div>
                      <div className="hover:text-pink transition duration-200">
                        <p className="font-bold">Keywords</p>
                        <div className="p-2 bg-white rounded-lg my-2">
                          <TagsInput value={keywords} onChange={tags => setKeywords(tags)} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
            <div className="grid grid-cols-4 gap-8 my-8">
              {results.map(movie => 
                <ResultCard key={movie.movie_id} id={movie.movie_id} title={movie.title} url={movie.poster_path} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Browse


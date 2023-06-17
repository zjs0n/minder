import { React } from 'react'
import { useNavigate, generatePath, createSearchParams } from 'react-router-dom'

const ResultCard = ({ id, title, url, numLikes }) => {
  const navigate = useNavigate()

  const goToMovie = (id) => {
    const path = generatePath(':url?:queryString', {
      url: '/movie',
      queryString: createSearchParams({ id }).toString(),
    })
    navigate(path)
  }

  return (
    <div onClick={() => goToMovie(id)} className="hover:text-pink transition duration-300 cursor-pointer">
      <div className={`h-[350px] w-full bg-[url(${url})] bg-cover bg-center bg-no-repeat rounded-xl`} />
      <p className="font-bold text-lg text-center mt-4">{title}</p>
      {numLikes && <p className="font-bold text-lg text-center">{numLikes} {numLikes === 1 ? `Like` : `Likes`}</p>}
    </div>
  )
}

export default ResultCard

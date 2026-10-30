import { useParams } from 'react-router-dom'

function User() {
    const {userid} = useParams()
  return (
    <div className="simple-content-page">User: {userid}</div>
  )
}

export default User
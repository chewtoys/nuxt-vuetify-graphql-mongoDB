import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const getUser = async (authorization, secrets, mongo) => {
  console.log('getUser 1 : authorization : ', authorization)
  const bearerLength = 'Bearer '.length
  if (authorization && authorization.length > bearerLength) {
    const token = authorization.slice(bearerLength)
    const { ok, result } = await new Promise(resolve =>
      jwt.verify(token, secrets.JWT_SECRET, (err, result) => {
        if (err) {
          resolve({
            ok: false,
            result: err
          })
        } else {
          console.log('token verified!')
          resolve({
            ok: true,
            result
          })
        }
      })
    )

    if (ok) {
      const user = await mongo
        .collection('users')
        .findOne({ _id: ObjectId(result._id) })
      console.log('getUser > user :', user)
      return user
    } else {
      console.error(result)
      return null
    }
  }

  return null
}

export async function context(headers, secrets, mongo) {
  // Optional: Export a function to get context from the request.
  const user = await getUser(headers.authorization, secrets, mongo)
  return { headers, secrets, mongo, user }
}

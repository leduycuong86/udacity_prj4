// auth.mjs
import jwt from 'jsonwebtoken'
import createLogger from '../../utils/logger.js'
import Axios from 'axios'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-5ifybf6o7crps5in.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwtDecoded = jwt.decode(token, { complete: true })

  const response = await Axios.get(jwksUrl);
  const keys = response.data.keys;
  const signingKey = keys.find(key => key.kid === jwtDecoded.header.kid);

  if (!signingKey) {
    throw new Error("Incorrect Keys");
  }
  const pem = `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----`;

  const verifiedToken = jwt.verify(token, pem, { algorithms: ['RS256'] });

  logger.info('Verify token', verifiedToken);
  return verifiedToken;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

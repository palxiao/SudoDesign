import axios from 'axios'

const httpRequest = axios.create()

httpRequest.interceptors.response.use((config) => {
  return config.data
})

export default httpRequest

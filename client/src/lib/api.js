import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('hf_token')
  const mailPass = sessionStorage.getItem('hf_pass')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (mailPass) config.headers['x-mail-password'] = mailPass
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hf_token')
      sessionStorage.removeItem('hf_pass')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

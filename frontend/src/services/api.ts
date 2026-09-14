import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
})

// antes de cada requisição feita com api, execute essa função
api.interceptors.request.use((config) => {
  // config é o objeto de configuração da requisição, e contém coisas como url, method, headers, body/data, params, baseURL
  const token = localStorage.getItem("helpdesk.token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

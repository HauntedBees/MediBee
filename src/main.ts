import { mount } from 'svelte'
import '../node_modules/bulma/bulma.scss'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Lang = 'en' | 'es'
type State = { language: Lang; theme: 'dark'|'light'; xp: number; saved: string[]; completed: string[]; achievements: string[]; lessonProgress: number }
type AppContextValue = State & { setLanguage:(v:Lang)=>void; toggleTheme:()=>void; toggleSaved:(slug:string)=>void; completeLesson:(score:number)=>boolean; setLessonProgress:(n:number)=>void }
const initial: State = {language:'en',theme:'dark',xp:2840,saved:[],completed:[],achievements:[],lessonProgress:42}
const AppContext = createContext<AppContextValue | null>(null)
export function AppProvider({children}:{children:ReactNode}) {
 const [state,setState]=useState<State>(initial)
 useEffect(()=>{ const raw=localStorage.getItem('realpolitics-state'); if(raw){try{setState({...initial,...JSON.parse(raw)})}catch{}} },[])
 useEffect(()=>{ document.documentElement.classList.toggle('light',state.theme==='light'); localStorage.setItem('realpolitics-state',JSON.stringify(state)) },[state])
 const value=useMemo<AppContextValue>(()=>({...state,setLanguage:(language)=>setState(s=>({...s,language})),toggleTheme:()=>setState(s=>({...s,theme:s.theme==='dark'?'light':'dark'})),toggleSaved:(slug)=>setState(s=>({...s,saved:s.saved.includes(slug)?s.saved.filter(x=>x!==slug):[...s.saved,slug]})),completeLesson:(score)=>{let unlocked=false;setState(s=>{if(s.completed.includes('robinson-crusoe-economic-thinking'))return s;unlocked=true;return {...s,xp:s.xp+120,completed:[...s.completed,'robinson-crusoe-economic-thinking'],achievements:[...s.achievements,'Island Economist'],lessonProgress:100}});return unlocked},setLessonProgress:(lessonProgress)=>setState(s=>({...s,lessonProgress}))}),[state])
 return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export function useApp(){const c=useContext(AppContext);if(!c)throw new Error('useApp must be inside AppProvider');return c}
export const ui={en:{home:'Home',explore:'Explore',paths:'Learning Paths',map:'Knowledge Map',timeline:'Timeline',challenges:'Challenges',library:'Library',search:'Search anything you want to understand...',continue:'Continue Learning'},es:{home:'Inicio',explore:'Explorar',paths:'Rutas de aprendizaje',map:'Mapa del conocimiento',timeline:'Cronología',challenges:'Desafíos',library:'Biblioteca',search:'Busca cualquier cosa que quieras entender...',continue:'Continuar aprendiendo'}}

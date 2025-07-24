import VideoPlayer from './components/VideoPlayer'
import './App.css'

function App() {
  return (
    <div className="container">
      <h1>Video Player con google drive</h1>
      <VideoPlayer videoId="video1" />
    </div>
  )
}

export default App
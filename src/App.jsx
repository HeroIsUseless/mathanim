import './App.css'
import { useEngine } from './engine/v13'

function App() {
  useEngine()
  return (
    <>
      <div className='main'>
        <canvas id="glcanvas" width="300" height="400">
          你的浏览器似乎不支持或者禁用了 HTML5 <code>&lt;canvas&gt;</code> 元素。
        </canvas>
        <div id='test-img'></div>
        <div id='videoContainer'>    <video width="300"
           height="300"
           controls={true}
           id="video"
           ></video></div>
      </div>
    </>
  )
}

export default App

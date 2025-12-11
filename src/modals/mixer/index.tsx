import style from './mixer.module.scss'
import { useContext, useEffect, useRef, useState } from 'react'
import { ChannelContext } from '../../context/channel/channelContext'
import Select, { SelectOption } from '../../elements/select'

export default function ModalMixer({ close }: { close: Function }) {
  const { devices, localStream, deviceChange } = useContext(ChannelContext)
  const [devicesVid, setDevicesVid] = useState<SelectOption[]>()
  const [devicesMic, setDevicesMic] = useState<SelectOption[]>()
  const [devicesOut, setDevicesOut] = useState<SelectOption[]>()
  const streamRef = useRef<MediaStream>()
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const changeVid = (event: React.ChangeEvent<HTMLSelectElement>) => {
    deviceChange({ type: 'video', deviceId: event.target.value })
  }
  const changeMic = (event: React.ChangeEvent<HTMLSelectElement>) => {
    deviceChange({ type: 'audio', deviceId: event.target.value })
  }
  const changeOut = (event: React.ChangeEvent<HTMLSelectElement>) => {
    deviceChange({ type: 'output', deviceId: event.target.value })
  }

  const updateDevices = () => {
    console.log('Devices changed')

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        const vid: SelectOption[] = []
        const mic: SelectOption[] = []
        const out: SelectOption[] = []
        devices.forEach((d) => {
          if (d.kind === 'videoinput' && d.deviceId) vid.push({ value: d.deviceId, name: d.label })
          else if (d.kind === 'audioinput' && d.deviceId) mic.push({ value: d.deviceId, name: d.label })
          else if (d.kind === 'audiooutput' && d.deviceId) out.push({ value: d.deviceId, name: d.label })
        })
        setDevicesVid(vid)
        setDevicesMic(mic)
        setDevicesOut(out)
      })
      .catch((error) => console.error(error))
  }

  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream) localVideoRef.current.srcObject = localStream
      else localVideoRef.current.srcObject = null
    }
    if (localStream) updateDevices()
  }, [localStream])

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', updateDevices)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateDevices)
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Select media devices</h1>
      <div className={style.section}>
        <video className={style.video} ref={localVideoRef} muted autoPlay />
        {!localStream && <div className={style.off}>Enable media</div>}
      </div>
      {devicesVid && devicesVid.length > 0 && (
        <div className={style.section}>
          <div className={style.label}>Camera</div>
          <Select options={devicesVid} selected={devices.video} onChange={changeVid} />
        </div>
      )}
      {devicesMic && devicesMic.length > 0 && (
        <div className={style.section}>
          <div className={style.label}>Microfone</div>
          <Select options={devicesMic} selected={devices.audio} onChange={changeMic} />
          {/* <Equalizer volume={localVideoRef.current?.volume || 0} /> */}
          <MicrophoneVolume2 />
        </div>
      )}
      {devicesOut && devicesOut.length > 0 && (
        <div className={style.section}>
          <div className={style.label}>Output device</div>
          <Select options={devicesOut} selected={devices.output} onChange={changeOut} />
        </div>
      )}
    </div>
  )
}

// const Equalizer = ({ volume }: { volume: number }) => {
//   const barsAmount = 12
//   const array = Array.from({ length: barsAmount }, (_, i) => i + 1)

//   const [strength, setStrength] = useState<number>(5)

//   function getRandomInt(min: number, max: number) {
//     return Math.floor(Math.random() * (max - min + 1)) + min
//   }

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const newValue = getRandomInt(0, barsAmount)
//       setStrength(newValue)
//     }, 600)
//     return () => {
//       clearInterval(interval)
//     }
//   }, [])

//   return (
//     <div className={style.equalizer}>
//       {array.map((e) => (
//         <span key={e} className={`${style.bar}${volume >= e ? ` ${style.filled}` : ''}`} />
//       ))}
//       <span>&nbsp;{volume}</span>
//     </div>
//   )
// }

// const MicrophoneVolume = () => {
//   const [volume, setVolume] = useState(0)
//   const audioContextRef = useRef<AudioContext>()
//   const analyserRef = useRef<AnalyserNode>()
//   const dataArrayRef = useRef<Uint8Array>()

//   useEffect(() => {
//     let animationFrameId: number

//     const initMicrophone = async () => {
//       try {
//         // Request microphone access
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

//         // Initialize AudioContext and AnalyserNode
//         const audioContext = new AudioContext()
//         const analyser = audioContext.createAnalyser()
//         const microphone = audioContext.createMediaStreamSource(stream)

//         analyser.fftSize = 256 // Set FFT size
//         dataArrayRef.current = new Uint8Array(analyser.fftSize)

//         // Connect the microphone to the analyser
//         microphone.connect(analyser)

//         audioContextRef.current = audioContext
//         analyserRef.current = analyser

//         // Function to calculate and update volume
//         const updateVolume = () => {
//           if (!dataArrayRef.current) return
//           analyser.getByteTimeDomainData(dataArrayRef.current)
//           let sum = 0
//           for (let i = 0; i < dataArrayRef.current.length; i++) {
//             const value = dataArrayRef.current[i] - 128 // Center the waveform
//             sum += value * value
//           }
//           const rms = Math.sqrt(sum / dataArrayRef.current.length) // Root mean square
//           const normalizedVolume = rms / 128 // Normalize to [0, 1]
//           setVolume(normalizedVolume)

//           animationFrameId = requestAnimationFrame(updateVolume) // Repeat for real-time monitoring
//         }

//         updateVolume()
//       } catch (error) {
//         console.error('Error accessing microphone:', error)
//       }
//     }

//     initMicrophone()

//     return () => {
//       if (audioContextRef.current) audioContextRef.current.close()
//       cancelAnimationFrame(animationFrameId)
//     }
//   }, [])

//   return (
//     <div>
//       <h1>Microphone Volume Monitor</h1>
//       <div
//         style={{
//           width: '100%',
//           height: '30px',
//           backgroundColor: '#ddd',
//           borderRadius: '5px',
//           overflow: 'hidden',
//           marginTop: '10px',
//         }}>
//         <div
//           style={{
//             width: `${volume * 100}%`,
//             height: '100%',
//             backgroundColor: volume > 0.7 ? 'red' : 'green',
//             transition: 'width 0.1s',
//           }}></div>
//       </div>
//       <p>Volume: {(volume * 100).toFixed(2)}%</p>
//     </div>
//   )
// }

const MicrophoneVolume2 = () => {
  const [volume, setVolume] = useState(0)
  const [speaking, setSpeaking] = useState<boolean>(false)
  const interval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const startAudioCheck = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      const audioContext = new AudioContext()
      const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(mediaStream)
      const analyserNode = audioContext.createAnalyser()
      mediaStreamAudioSourceNode.connect(analyserNode)
      const pcmData = new Float32Array(analyserNode.fftSize)

      const checkAudio = () => {
        analyserNode.getFloatTimeDomainData(pcmData)
        let sumSquares = 0.0
        for (const amplitude of pcmData) {
          sumSquares += amplitude * amplitude
        }
        let vol = Math.sqrt(sumSquares / pcmData.length)
        if (vol > 0.05 && !speaking) {
          setSpeaking(true)
          setTimeout(() => {
            setSpeaking(false)
          }, 2000)
        }
        setVolume(vol)
      }

      interval.current = setInterval(checkAudio, 100)
    }
    startAudioCheck()
    return () => {
      clearInterval(interval.current)
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div>
      <h1>Microphone Volume Monitor</h1>
      <div
        style={{
          width: '100%',
          height: '30px',
          backgroundColor: '#ddd',
          borderRadius: '5px',
          overflow: 'hidden',
          marginTop: '10px',
        }}>
        <div
          style={{
            width: `${volume * 100}%`,
            height: '100%',
            backgroundColor: volume > 0.7 ? 'red' : 'green',
            transition: 'width 0.1s',
          }}></div>
      </div>
      <p>Volume: {(volume * 100).toFixed(2)}%</p>
    </div>
  )
}

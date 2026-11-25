// A truck passing on the road, synthesized: engine rumble and tyre hiss that swell as it comes, sweep
// from left to right, and drop in pitch as it goes (the Doppler drop). No audio file, nothing to license.
let ctx: AudioContext | null = null

function noise(audio: AudioContext, seconds: number) {
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    // Brown noise: a random walk, deep like an engine rather than hissy like white noise.
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

export function playTruckPass(volume = 0.22) {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return
  ctx ??= new AudioCtx()
  const audio = ctx
  if (audio.state === 'suspended') audio.resume()

  const duration = 1.6
  const t = audio.currentTime
  const source = audio.createBufferSource()
  source.buffer = noise(audio, duration)

  const tone = audio.createBiquadFilter()
  tone.type = 'lowpass'
  tone.Q.value = 1.4
  tone.frequency.setValueAtTime(380, t)
  tone.frequency.linearRampToValueAtTime(900, t + duration * 0.45)
  tone.frequency.exponentialRampToValueAtTime(220, t + duration)

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + duration * 0.42)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  const pan = audio.createStereoPanner()
  pan.pan.setValueAtTime(-0.9, t)
  pan.pan.linearRampToValueAtTime(0.9, t + duration)

  source.connect(tone).connect(gain).connect(pan).connect(audio.destination)
  source.start(t)
  source.stop(t + duration)
}

import Foundation

let sampleRate = 44_100
let durationSeconds = 28.0
let totalSamples = Int(durationSeconds * Double(sampleRate))
let bpm = 132.0
let beatSeconds = 60.0 / bpm
let twoPi = 2.0 * Double.pi

let melody: [(Double, Double)] = [
    (523.25, 0.5), (659.25, 0.5), (783.99, 0.5), (659.25, 0.5),
    (587.33, 0.5), (739.99, 0.5), (880.00, 0.5), (739.99, 0.5),
    (523.25, 0.5), (659.25, 0.5), (783.99, 0.5), (987.77, 0.5),
    (880.00, 0.5), (783.99, 0.5), (659.25, 0.5), (587.33, 0.5)
]

let bass: [(Double, Double)] = [
    (130.81, 1.0), (196.00, 1.0), (146.83, 1.0), (220.00, 1.0)
]

func envelope(_ t: Double, _ length: Double) -> Double {
    let attack = min(0.018, length * 0.2)
    let release = min(0.09, length * 0.35)
    if t < attack { return t / attack }
    if t > length - release { return max(0, (length - t) / release) }
    return 1.0
}

func tone(_ freq: Double, _ time: Double) -> Double {
    let base = sin(twoPi * freq * time)
    let bright = 0.42 * sin(twoPi * freq * 2.0 * time)
    let sparkle = 0.18 * sin(twoPi * freq * 3.0 * time)
    return base + bright + sparkle
}

func noteValue(_ pattern: [(Double, Double)], _ time: Double, _ volume: Double, _ octaveShift: Double = 1.0) -> Double {
    let patternLength = pattern.reduce(0.0) { $0 + $1.1 * beatSeconds }
    var local = time.truncatingRemainder(dividingBy: patternLength)
    for (freq, beats) in pattern {
        let length = beats * beatSeconds
        if local < length {
            return tone(freq * octaveShift, local) * envelope(local, length) * volume
        }
        local -= length
    }
    return 0
}

func click(_ time: Double, every beats: Double, freq: Double, volume: Double) -> Double {
    let length = 0.035
    let local = time.truncatingRemainder(dividingBy: beats * beatSeconds)
    if local > length { return 0 }
    return sin(twoPi * freq * local) * envelope(local, length) * volume
}

var pcm = Data()
pcm.reserveCapacity(totalSamples * 4)

for i in 0..<totalSamples {
    let t = Double(i) / Double(sampleRate)
    let fadeIn = min(1.0, t / 1.2)
    let fadeOut = min(1.0, (durationSeconds - t) / 1.8)
    let fade = max(0.0, min(fadeIn, fadeOut))

    var value = 0.0
    value += noteValue(melody, t, 0.16)
    value += noteValue(melody, t + beatSeconds * 0.25, 0.055, 2.0)
    value += noteValue(bass, t, 0.075)
    value += click(t, every: 0.5, freq: 1250, volume: 0.035)
    value += click(t + beatSeconds * 0.25, every: 1.0, freq: 320, volume: 0.03)
    value *= fade

    let clipped = max(-0.92, min(0.92, value))
    let sample = Int16(clipped * Double(Int16.max))
    var left = sample.littleEndian
    var right = sample.littleEndian
    withUnsafeBytes(of: &left) { pcm.append(contentsOf: $0) }
    withUnsafeBytes(of: &right) { pcm.append(contentsOf: $0) }
}

func littleEndianUInt32(_ value: UInt32) -> [UInt8] {
    [
        UInt8(value & 0xff),
        UInt8((value >> 8) & 0xff),
        UInt8((value >> 16) & 0xff),
        UInt8((value >> 24) & 0xff)
    ]
}

func littleEndianUInt16(_ value: UInt16) -> [UInt8] {
    [UInt8(value & 0xff), UInt8((value >> 8) & 0xff)]
}

let dataSize = UInt32(pcm.count)
var wav = Data()
wav.append(contentsOf: "RIFF".utf8)
wav.append(contentsOf: littleEndianUInt32(36 + dataSize))
wav.append(contentsOf: "WAVEfmt ".utf8)
wav.append(contentsOf: littleEndianUInt32(16))
wav.append(contentsOf: littleEndianUInt16(1))
wav.append(contentsOf: littleEndianUInt16(2))
wav.append(contentsOf: littleEndianUInt32(UInt32(sampleRate)))
wav.append(contentsOf: littleEndianUInt32(UInt32(sampleRate * 2 * 2)))
wav.append(contentsOf: littleEndianUInt16(4))
wav.append(contentsOf: littleEndianUInt16(16))
wav.append(contentsOf: "data".utf8)
wav.append(contentsOf: littleEndianUInt32(dataSize))
wav.append(pcm)

let output = URL(fileURLWithPath: "promotion/toy-battle-bgm.wav")
try wav.write(to: output)

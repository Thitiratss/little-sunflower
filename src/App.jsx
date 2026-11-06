import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

const SONG = {
  title: "เพลงส่วนบุคคล",
  artist: "fellow fellow",
  note: "javamyaodiwa",
  src: "/song.mp3",
};

const FLOWER_COUNT = 65;
const FLOWERS = Array.from({ length: FLOWER_COUNT }, (_, index) => index);
const PETAL_COLORS = ["#ffc95a", "#ffd46d", "#f8b944", "#ffd163"];

function Sunflower({ index }) {
  const width = 48 + ((index * 31) % 39);
  const height = 48 + ((index * 17) % 47);
  const heightInPixels = (window.innerHeight * height) / 100;
  const flowerScaleY = Math.min(1, (width * 2.4) / heightInPixels);

  return (
    <span
      className="sunflower"
      aria-hidden="true"
      style={{
        left: `${(index * 53 + 7) % 100}%`,
        width: `${width}px`,
        height: `${height}vh`,
        animationDelay: `${index * 0.045}s`,
        zIndex: 1 + (index % 3),
      }}
    >
      <svg viewBox="0 0 100 240" preserveAspectRatio="none">
        <path className="sunflower-stem" d="M50 55 C45 104 59 158 51 236" />
        <path
          className="sunflower-leaf"
          d="M49 147 C28 119 11 126 19 143 C27 155 41 157 49 147Z"
          transform={`translate(0 ${145 * (1 - flowerScaleY)}) scale(1 ${flowerScaleY})`}
        />
        <path
          className="sunflower-leaf sunflower-leaf-alt"
          d="M53 179 C69 151 88 155 83 172 C79 184 65 188 53 179Z"
          transform={`translate(0 ${175 * (1 - flowerScaleY)}) scale(1 ${flowerScaleY})`}
        />
        <path
          className="sunflower-leaf"
          d="M48 202 C34 185 21 189 27 201 C32 210 42 211 48 202Z"
          transform={`translate(0 ${198 * (1 - flowerScaleY)}) scale(1 ${flowerScaleY})`}
        />
        <g
          transform={`translate(0 ${50 * (1 - flowerScaleY)}) scale(1 ${flowerScaleY})`}
        >
          {Array.from({ length: 16 }, (_, petal) => (
            <ellipse
              key={petal}
              cx="50"
              cy="29"
              rx="7.5"
              ry="20"
              fill={PETAL_COLORS[(petal + index) % PETAL_COLORS.length]}
              stroke="#eeaa37"
              strokeWidth="1.2"
              transform={`rotate(${petal * 22.5} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="15" fill="#79502f" />
          <circle cx="45" cy="45" r="1.5" fill="#e5b34d" />
          <circle cx="55" cy="44" r="1.4" fill="#e5b34d" />
          <circle cx="50" cy="51" r="1.5" fill="#e5b34d" />
          <circle cx="44" cy="55" r="1.2" fill="#e5b34d" />
          <circle cx="56" cy="56" r="1.2" fill="#e5b34d" />
        </g>
      </svg>
    </span>
  );
}

const formatTime = (time) => {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function App() {
  const [step, setStep] = useState(1);
  const [isOpening, setIsOpening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const audioRef = useRef(null);
  const openTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(openTimerRef.current), []);

  const openLetter = () => {
    if (isOpening) return;
    setIsOpening(true);
    openTimerRef.current = window.setTimeout(() => setStep(2), 360);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setPlaybackError("");
      } catch {
        setPlaybackError("เปิดเพลงไม่สำเร็จ ลองแตะเล่นอีกครั้งนะ");
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
  };

  const seek = (event) => {
    const time = Number(event.target.value);
    if (!audioRef.current || !Number.isFinite(time)) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      if (audio.volume === 0) audio.volume = 1;
    } else {
      audio.muted = true;
    }
    setIsMuted(audio.muted);
    setVolume(audio.volume);
  };

  const changeVolume = (event) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Number(event.target.value);
    if (audio.volume > 0) audio.muted = false;
    setVolume(audio.volume);
    setIsMuted(audio.muted || audio.volume === 0);
  };

  const restart = () => {
    window.clearTimeout(openTimerRef.current);
    setIsOpening(false);
    setStep(1);
    setCurrentTime(0);
    setPlaybackError("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;
      audioRef.current.volume = 1;
      setIsMuted(false);
      setVolume(1);
      setIsLoading(false);
    }
  };

  return (
    <div className="gift-page">
      <audio
        ref={audioRef}
        src={SONG.src}
        preload="metadata"
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setIsLoading(false);
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setIsMuted(
            event.currentTarget.muted || event.currentTarget.volume === 0,
          );
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setIsLoading(false);
          setPlaybackError(
            "เปิดไฟล์เพลงไม่ได้ ลองตรวจสอบ public/song.mp3 แล้ว deploy ใหม่อีกครั้งนะ",
          );
        }}
      />

      <header className="topbar">
        <div className="wordmark">
          <span className="wordmark-heart">
            <Heart size={14} fill="currentColor" />
          </span>
          <span>dear, you</span>
          <span className="wordmark-korean">javamyaodiwa</span>
        </div>
        <button className="restart-button" type="button" onClick={restart}>
          <RotateCcw size={13} />
          <span>เริ่มใหม่</span>
        </button>
      </header>

      <main className="gift-main">
        <div className="step-indicator" aria-label={`ขั้นตอนที่ ${step} จาก 4`}>
          {[1, 2, 3, 4].map((number) => (
            <span
              className={
                number === step
                  ? "step-dot is-active"
                  : number < step
                    ? "step-dot is-done"
                    : "step-dot"
              }
              key={number}
            />
          ))}
          <span className="step-label">
            {step === 3
              ? "sunflowers for you"
              : step === 4
                ? "a little song for you"
                : "a little note for you"}
          </span>
        </div>

        {step === 1 && (
          <section
            className={`letter-scene ${isOpening ? "is-opening" : ""}`}
            aria-labelledby="welcome-title"
          >
            <div className="envelope-card">
              <span className="envelope-stamp">
                <Heart size={17} fill="currentColor" />
              </span>
              <span className="envelope-postmark">
                Friday, November 6, 2569
              </span>
              <div className="envelope-fold" aria-hidden="true" />
              <span className="envelope-letter">Hi! my future gf</span>
              <span className="envelope-seal" aria-hidden="true">
                <Heart size={20} fill="currentColor" />
              </span>
            </div>

            <div className="intro-copy">
              <p className="eyebrow">
                <Sparkles size={13} /> a little something · just for you
              </p>
              <h1 id="welcome-title">
                มีใครบางคน
                <br />
                อยากให้พี่ฟังเพลงนี้
              </h1>
              <p className="intro-subtitle">
                ถึง พี่ฝุ่น <span>·</span> จาก น้องปอย
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={openLetter}
              >
                <span>เปิดจดหมาย</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="scene-caption">
              made just for you <span>♡</span>
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="note-card" aria-labelledby="note-title">
            <div className="note-topline">
              <span>TO. MY FAVORITE PERSON</span>
              <span>06 NOV 2026</span>
            </div>
            <div className="note-heart">
              <Heart size={20} fill="currentColor" />
            </div>
            <p className="note-korean">for someone who makes me smile ♡</p>
            <h1 id="note-title">Hi, my favorite person</h1>
            <div className="note-message">
              <p>
                มาฟังเพลงกัง
                <br />
                ฟังในนี้จะฟรินกว่ามั้ยน้า
              </p>
              <p className="note-signature">— จาก น้องปอย</p>
            </div>
            <button
              className="primary-button note-continue"
              type="button"
              onClick={() => setStep(3)}
            >
              <span>มีอะไรให้ดูอีกนิดนึง</span>
              <ArrowRight size={16} />
            </button>
            <p className="note-footer">a song picked with you in mind ♡</p>
          </section>
        )}

        {step === 3 && (
          <section className="sunflower-scene" aria-labelledby="flower-message">
            <div className="sunflower-sky" aria-hidden="true" />
            <div className="sunflower-field">
              {FLOWERS.map((index) => (
                <Sunflower index={index} key={index} />
              ))}
            </div>
            <div className="flower-message">
              <p className="flower-eyebrow">
                <Heart size={13} fill="currentColor" /> for you, sunshine
              </p>
              <h1 id="flower-message">
                <span>you had me at</span>
                <strong>
                  hello<span className="hello-heart">♡</span>
                </strong>
              </h1>
              <button
                className="flower-continue"
                type="button"
                onClick={() => setStep(4)}
              >
                <span>พี่ฝุ่นจิ้ม ๆๆๆ</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <span className="flower-note flower-note-one" aria-hidden="true">
              ♡
            </span>
            <span className="flower-note flower-note-two" aria-hidden="true">
              ✦
            </span>
            <span className="flower-note flower-note-three" aria-hidden="true">
              ♡
            </span>
          </section>
        )}

        {step === 4 && (
          <section className="player-card" aria-labelledby="song-title">
            <div className="player-topline">
              <span className="side-label">
                <Music2 size={12} /> SIDE A
              </span>
              <span className="private-label">
                ONLY FOR YOU <Heart size={11} fill="currentColor" />
              </span>
            </div>

            <div className={`record-stage ${isPlaying ? "is-playing" : ""}`}>
              <span className="record-sparkle sparkle-one">✳</span>
              <span className="record-sparkle sparkle-two">✦</span>
              <div className="vinyl" aria-hidden="true">
                <div className="vinyl-grooves">
                  <div className="vinyl-label">
                    <Heart size={23} fill="currentColor" />
                    <span>POY’S PICK</span>
                  </div>
                </div>
              </div>
              <div className="tonearm" aria-hidden="true">
                <span />
              </div>
              <div className="record-caption">
                a little record, just for you
              </div>
            </div>

            <div className="song-details">
              <p className="song-korean">a personal song ♡</p>
              <h1 id="song-title">{SONG.title}</h1>
              <p>
                {SONG.artist}
                <span className="song-divider">·</span>
                {SONG.note}
              </p>
            </div>

            <div className="audio-controls">
  <label className="sr-only" htmlFor="song-progress">
    ตำแหน่งเพลง
  </label>

  <input
    id="song-progress"
    className="progress-slider"
    type="range"
    min="0"
    max={duration || 0}
    step="0.1"
    value={Math.min(currentTime, duration || 0)}
    onChange={seek}
    disabled={!duration}
    style={{
      "--progress": `${duration ? (currentTime / duration) * 100 : 0}%`,
    }}
  />

  <div className="time-row">
    <span>{formatTime(currentTime)}</span>
    <span>{formatTime(duration)}</span>
  </div>

  {/* ปุ่มเล่นเพลงและปรับเสียง */}
  <div className="control-row">
    <button
      className="play-button"
      type="button"
      onClick={togglePlay}
      aria-label={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
    >
      {isPlaying ? (
        <Pause size={21} fill="currentColor" />
      ) : (
        <Play size={21} fill="currentColor" />
      )}
    </button>

    <label className="volume-control">
      <Volume2 size={16} />

      <span className="sr-only">ระดับเสียงเพลง</span>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={changeVolume}
        aria-label="ระดับเสียงเพลง"
      />
    </label>
  </div>

  {/* ปุ่มกลับไปดูดอกทานตะวัน */}
  <div className="back-row">
    <button
      className="back-button"
      type="button"
      onClick={() => setStep(3)}
      aria-label="กลับไปดูดอกทานตะวัน"
    >
      <ArrowLeft size={16} />
      <span>กลับไปดูดอกทานตะวันมั้ยจ้ะ</span>
    </button>
  </div>

  {playbackError && (
    <p className="playback-error" role="alert">
      {playbackError}
    </p>
  )}

  <p className="audio-hint">
    {isLoading
      ? "กำลังโหลดเพลง…"
      : isPlaying
        ? "นปกำลังเปิดเพลงเล่นให้พี่ฟัง"
        : "ยังไม่ได้ยินหรอออ เปิดเสียงเร็ววววพี่ฝุ่นน"}
  </p>
</div>

            <p className="player-footer">
              press play & think of me <span>♡</span>
            </p>
          </section>
        )}
      </main>

      <footer className="page-footer">
        <span>
          POY <Heart size={11} fill="currentColor" /> LNWZA007
        </span>
        <span>JUST BETWEEN US</span>
      </footer>
    </div>
  );
}

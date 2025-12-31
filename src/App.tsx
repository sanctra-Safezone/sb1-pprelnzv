import { useGlobalGardenAudio } from "./lib/useGlobalGardenAudio";

function App() {
  const { audioRef, unlocked, unlock, toggle } =
    useGlobalGardenAudio("/audio/Strong-Have-Mindset.mp3");

  return (
    <>
      {!unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            onClick={unlock}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl"
          >
            Tap to enable garden sound
          </button>
        </div>
      )}

      <audio ref={audioRef} loop preload="auto" />

      {/* rest of app */}
    </>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ShiritoriGame() {
  
  const [players] = useState(["Player 1", "Player 2"]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [word, setWord] = useState("");
  const [lastWord, setLastWord] = useState("");
  const [history, setHistory] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [timer, setTimer] = useState(20);

  //Here Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      handleFailTurn("⏰ Time's up!");
      return;
    }
    const interval = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(interval);
  }, [timer]);

  // for validate word via DictionaryAPI
  const validateWord = async (w) => {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${w.toLowerCase()}`
      );
      return res.ok;
    } catch {
      return false;
    }
  };

  // Fail turn popup
  const handleFailTurn = (message) => {
    Swal.fire({
      icon: "error",
      title: `${players[currentPlayer]} failed!`,
      text: message,
      confirmButtonColor: "#4f46e5",
    });
    const newScores = [...scores];
    newScores[currentPlayer] = Math.max(0, newScores[currentPlayer] - 1);
    setScores(newScores);
    nextTurn();
  };

  const nextTurn = () => {
    setCurrentPlayer((prev) => (prev + 1) % players.length);
    setTimer(20);
    setWord("");
  };

  //for handle word submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || word.length < 4) {
      return handleFailTurn("Word must be at least 4 letters!");
    }
    if (history.includes(word.toLowerCase())) {
      return handleFailTurn("Word already used!");
    }
    if (lastWord && word[0].toLowerCase() !== lastWord.slice(-1).toLowerCase()) {
      return handleFailTurn(`Word must start with '${lastWord.slice(-1)}'`);
    }

    const valid = await validateWord(word);
    if (!valid) return handleFailTurn("Not a valid English word!");

    // for Correct words
    const newScores = [...scores];
    newScores[currentPlayer] += word.length; // score by word length
    setScores(newScores);
    setHistory([...history, word.toLowerCase()]);
    setLastWord(word);
    nextTurn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-blue-200 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow-lg mb-8 animate-pulse">
        Multiplayer Shiritori
      </h1>

      {/* Players & Scores Section*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-8">
        {players.map((p, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl shadow-xl text-center transition-transform ${
              currentPlayer === i
                ? "bg-indigo-500 scale-105 border-2 border-indigo-700 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <h2 className="text-2xl font-semibold">{p}</h2>
            <p className="text-3xl font-bold mt-2">{scores[i]}</p>
            {currentPlayer === i && <p className="mt-1 text-sm">⏳ {timer}s</p>}
          </div>
        ))}
      </div>

      {/*Here is Input Section */}
      <div className="w-full max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-xl p-6 mb-8">
        {lastWord && (
          <p className="text-center mb-4 text-gray-700">
            Last word: <span className="font-bold text-indigo-600">{lastWord}</span>
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-4 ">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={
              lastWord
                ? `Start with '${lastWord.slice(-1)}'`
                : "Enter a word"
            }
            className=" flex-grow px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 "
          />
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-transform">
            Submit
          </button>
        </form>
      </div>

      {/*It will show Word History */}
      <div className="w-full max-w-5xl mx-auto bg-white/80 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-pink-500">Word History</h2>
        <div className="flex flex-wrap gap-3">
          {history.length === 0 ? (
            <p className="text-gray-500 italic">No words played yet.</p>
          ) : (
            history.map((his, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium shadow-md"
              >
                {his}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

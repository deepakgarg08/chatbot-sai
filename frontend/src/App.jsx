import React from 'react';
import Chat from './components/Chat';
import './App.css';


function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-center text-3xl font-bold mb-8">Real-Time Chat App</h1>
      <Chat />
    </div>
  );
}

export default App;

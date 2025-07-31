export default function ChatMessage({ message, isOwnMessage, avatarUrl }) {
  return (
    <div className={`flex items-end mb-6 ${isOwnMessage ? 'justify-end' : 'justify-start'} mt-2`}>
      {!isOwnMessage && (
        <img
          src={avatarUrl || `https://ui-avatars.com/api/?name=${message.user}`}
          alt="Avatar"
          className="w-10 h-10 rounded-full mr-4 border shadow flex-shrink-0"
        />
      )}
      <div
        className={`
          max-w-[60%]        /* Bubble max width */
          px-8 py-5          /* Padding */
          ${isOwnMessage
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-t-3xl rounded-bl-3xl'
            : 'bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-600 text-white rounded-t-3xl rounded-br-3xl shadow-lg'}
        `}
        style={{ minWidth: "140px" }}
      >
        <p className="text-base font-semibold leading-relaxed">{message.text}</p>
        <div
          className="mt-3 text-xs font-semibold text-purple-200 opacity-90 text-right"
          style={{ letterSpacing: '0.02em' }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isOwnMessage && <div className="w-10 h-10 ml-4" />}
    </div>
  );
}

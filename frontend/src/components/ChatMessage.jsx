export default function ChatMessage({ message, isOwnMessage, avatarUrl }) {
  return (
    <div className={`flex items-end mb-6 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <img
          src={avatarUrl || `https://ui-avatars.com/api/?name=${message.user}`}
          alt=""
          className="w-5 h-5 rounded-full mr-3 border shadow flex-shrink-0"
        />
      )}
      <div
        className={`
      max-w-[80%]
      px-6 py-4
      ${isOwnMessage
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-t-3xl rounded-bl-3xl'
            : 'bg-gray-200 text-gray-900 rounded-t-3xl rounded-br-3xl border border-gray-200'}
    `}
        style={{ minWidth: "120px" }} // Optional: prevents tiny bubbles for very short messages
      >
        <p className="text-base font-normal leading-relaxed">{message.text}</p>
        <div
          className="mt-3 text-xs font-semibold text-purple-200 opacity-80 text-right"
          style={{ letterSpacing: '0.02em' }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isOwnMessage && <div className="w-5 h-5 ml-3" />}
    </div>

  );
}

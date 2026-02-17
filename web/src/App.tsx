import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { io, Socket } from 'socket.io-client';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// Components
const Sidebar = ({ agents, conversations, selectedAgentId, onSelectAgent }: any) => (
  <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
    <div className="p-4 font-bold text-yellow-500 border-b border-gray-700 text-xs">AGENTS</div>
    <div className="flex-grow overflow-y-auto">
      {agents.map((agent: any) => (
        <div
          key={agent.id}
          onClick={() => onSelectAgent(agent.id)}
          className={`p-3 cursor-pointer hover:bg-gray-700 text-sm ${selectedAgentId === agent.id ? 'bg-gray-700 text-cyan-400' : ''}`}
        >
          {agent.name || agent.id.slice(0, 8)}
        </div>
      ))}
    </div>
    <div className="p-4 font-bold text-yellow-500 border-t border-gray-700 text-xs">CONVERSATIONS</div>
    <div className="flex-grow overflow-y-auto">
      {conversations.map((conv: any) => (
        <div key={conv.id} className="p-3 hover:bg-gray-700 cursor-pointer text-gray-400 text-xs">
          {conv.name || conv.id.slice(0, 8)}
        </div>
      ))}
    </div>
  </div>
);

const FileTree = ({ socket }: { socket: Socket | null }) => {
  const [files, setFiles] = useState([]);
  const [currentDir, setCurrentDir] = useState('.');

  useEffect(() => {
    if (!socket) return;
    socket.emit('file:list', currentDir);
    const handler = (data: any) => setFiles(data);
    socket.on('file:list:result', handler);
    return () => { socket.off('file:list:result', handler); };
  }, [socket, currentDir]);

  return (
    <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 font-bold text-yellow-500 border-b border-gray-700 flex justify-between text-xs">
        <span>FILES</span>
        <button onClick={() => setCurrentDir('.')} className="text-xs bg-gray-700 px-2 rounded">Root</button>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {files.map((file: any) => (
          <div
            key={file.path}
            className="flex items-center space-x-2 p-1 hover:bg-gray-700 cursor-pointer text-xs"
            onClick={() => file.isDirectory && setCurrentDir(file.path)}
          >
            <span>{file.isDirectory ? '📁' : '📄'}</span>
            <span className={file.isDirectory ? 'text-blue-400 truncate' : 'text-gray-300 truncate'}>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Terminal = ({ socket }: { socket: Socket | null }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new XTerm({
      theme: { background: '#111827' },
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'monospace',
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.onData(data => socket.emit('terminal:input', data));
    const handler = (data: string) => term.write(data);
    socket.on('terminal:data', handler);

    xtermRef.current = term;

    return () => {
      term.dispose();
      socket.off('terminal:data', handler);
    };
  }, [socket]);

  return <div ref={terminalRef} className="h-48 bg-gray-900 border-t border-gray-700" />;
};

const Chat = ({ messages, onSend }: any) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-grow flex flex-col">
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((m: any, i: number) => (
          <div key={i} className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-900 ml-auto max-w-lg' : 'bg-gray-800 mr-auto max-w-lg'}`}>
            <div className="text-[10px] text-gray-500 mb-1 uppercase font-bold">{m.role}</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) onSend(input); setInput(''); }} className="flex space-x-2">
          <input
            className="flex-grow bg-gray-800 border border-gray-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
          />
          <button className="bg-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-500">Send</button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  useEffect(() => {
    const s = io();
    setSocket(s);
    s.on('connect', () => console.log('Connected to server'));
    s.on('state:update', (data) => {
      console.log('State update received');
      if (data.agents) setAgents(data.agents);
      if (data.conversations) setConversations(data.conversations);
      if (data.messages) setMessages(data.messages);
      if (data.selectedAgentId) setSelectedAgentId(data.selectedAgentId);
    });
    return () => { s.disconnect(); };
  }, []);

  const handleSend = (text: string) => {
    socket?.emit('chat:send', text);
  };

  return (
    <div className="flex h-full bg-gray-900 text-gray-100 font-sans">
      <Sidebar
        agents={agents}
        conversations={conversations}
        selectedAgentId={selectedAgentId}
        onSelectAgent={(id: string) => socket?.emit('agent:select', id)}
      />
      <FileTree socket={socket} />
      <div className="flex-grow flex flex-col">
        <Chat messages={messages} onSend={handleSend} />
        <Terminal socket={socket} />
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

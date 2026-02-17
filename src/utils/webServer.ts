import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import open from 'open';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

export interface WebServerConfig {
  port: number;
  staticPath: string;
}

export class WebServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private port: number;
  private currentState: any = {};

  constructor(config: WebServerConfig) {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server);
    this.port = config.port;

    this.app.use(express.static(config.staticPath));

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Web client connected');

      // Send initial state
      socket.emit('state:update', this.currentState);

      // Terminal bridge using spawn
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
      const term = spawn(shell, [], {
        cwd: process.cwd(),
        env: { ...process.env, TERM: 'xterm-256color' },
      });

      term.stdout.on('data', (data) => {
        socket.emit('terminal:data', data.toString());
      });

      term.stderr.on('data', (data) => {
        socket.emit('terminal:data', data.toString());
      });

      socket.on('terminal:input', (data) => {
        term.stdin.write(data);
      });

      socket.on('file:list', (dir = '.') => {
        try {
          const absolutePath = path.resolve(process.cwd(), dir);
          if (!fs.existsSync(absolutePath)) {
             socket.emit('error', 'Directory does not exist');
             return;
          }
          const files = fs.readdirSync(absolutePath, { withFileTypes: true });
          const result = files.map(f => ({
            name: f.name,
            isDirectory: f.isDirectory(),
            path: path.relative(process.cwd(), path.join(absolutePath, f.name))
          }));
          socket.emit('file:list:result', result);
        } catch (err) {
          socket.emit('error', 'Failed to list files');
        }
      });

      socket.on('chat:send', (text) => {
        this.emit('chat:send', text);
      });

      socket.on('agent:select', (id) => {
        this.emit('agent:select', id);
      });

      socket.on('disconnect', () => {
        term.kill();
      });
    });
  }

  private listeners: Record<string, ((data: any) => void)[]> = {};

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  public async start() {
    return new Promise<void>((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Web server running at http://localhost:${this.port}`);
        open(`http://localhost:${this.port}`).catch(() => {});
        resolve();
      });
    });
  }

  public setState(state: any) {
    this.currentState = { ...this.currentState, ...state };
    this.io.emit('state:update', this.currentState);
  }
}

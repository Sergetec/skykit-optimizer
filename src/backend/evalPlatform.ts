import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as os from 'os';

let evalProcess: ChildProcess | null = null;
let isStarting = false;

function getEvalPlatformPath(): string {
  const homeDir = os.homedir();
  const isWindows = os.platform() === 'win32';

  if (isWindows) {
    return path.join(homeDir, 'Desktop', 'HackitAll2025', 'eval-platform');
  } else {
    return path.join(homeDir, 'repos', 'HackitAll2025', 'eval-platform');
  }
}

export function isEvalPlatformRunning(): boolean {
  return evalProcess !== null && !evalProcess.killed;
}

export function isEvalPlatformStarting(): boolean {
  return isStarting;
}

export async function startEvalPlatform(): Promise<void> {
  if (isEvalPlatformRunning()) {
    console.log('[EVAL] Platform already running');
    return;
  }

  if (isStarting) {
    console.log('[EVAL] Platform is already starting...');
    return;
  }

  isStarting = true;
  const platformPath = getEvalPlatformPath();
  const isWindows = os.platform() === 'win32';

  console.log(`[EVAL] Starting eval-platform from: ${platformPath}`);

  return new Promise((resolve, reject) => {
    // Use shell: true on Windows for mvn command
    const command = isWindows ? 'mvn.cmd' : 'mvn';
    const args = ['spring-boot:run', '-Dspring-boot.run.profiles=local'];

    evalProcess = spawn(command, args, {
      cwd: platformPath,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let startupComplete = false;
    let outputBuffer = '';

    const checkStartup = (data: string) => {
      outputBuffer += data;
      // Look for Spring Boot started message
      if (outputBuffer.includes('Started EvalPlatformApplication') ||
          outputBuffer.includes('Tomcat started on port') ||
          outputBuffer.includes('Started Application')) {
        if (!startupComplete) {
          startupComplete = true;
          isStarting = false;
          console.log('[EVAL] Platform started successfully!');
          resolve();
        }
      }
    };

    evalProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      // Only log important lines
      if (output.includes('Started') || output.includes('Error') || output.includes('Exception')) {
        console.log(`[EVAL] ${output.trim()}`);
      }
      checkStartup(output);
    });

    evalProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      // Filter out maven download spam
      if (!output.includes('Downloading') && !output.includes('Downloaded')) {
        console.error(`[EVAL ERROR] ${output.trim()}`);
      }
      checkStartup(output);
    });

    evalProcess.on('error', (err) => {
      isStarting = false;
      console.error('[EVAL] Failed to start:', err.message);
      reject(err);
    });

    evalProcess.on('close', (code) => {
      isStarting = false;
      evalProcess = null;
      if (!startupComplete) {
        console.log(`[EVAL] Process exited with code ${code} before startup complete`);
        reject(new Error(`Eval platform exited with code ${code}`));
      } else {
        console.log(`[EVAL] Process exited with code ${code}`);
      }
    });

    // Timeout after 120 seconds
    setTimeout(() => {
      if (!startupComplete) {
        isStarting = false;
        console.error('[EVAL] Startup timeout (120s)');
        stopEvalPlatform();
        reject(new Error('Eval platform startup timeout'));
      }
    }, 120000);
  });
}

export async function stopEvalPlatform(): Promise<void> {
  if (!evalProcess) {
    console.log('[EVAL] No process to stop');
    return;
  }

  console.log('[EVAL] Stopping eval-platform...');

  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';

    if (isWindows) {
      // On Windows, kill the process tree
      spawn('taskkill', ['/pid', evalProcess!.pid!.toString(), '/f', '/t'], { shell: true });
    } else {
      // On Unix, send SIGINT twice (like Ctrl+C x2)
      evalProcess!.kill('SIGINT');
      setTimeout(() => {
        if (evalProcess && !evalProcess.killed) {
          evalProcess.kill('SIGINT');
        }
      }, 500);
    }

    // Wait for process to exit
    const checkInterval = setInterval(() => {
      if (!evalProcess || evalProcess.killed) {
        clearInterval(checkInterval);
        evalProcess = null;
        console.log('[EVAL] Platform stopped');
        resolve();
      }
    }, 100);

    // Force kill after 5 seconds
    setTimeout(() => {
      if (evalProcess && !evalProcess.killed) {
        evalProcess.kill('SIGKILL');
        evalProcess = null;
        clearInterval(checkInterval);
        console.log('[EVAL] Platform force killed');
        resolve();
      }
    }, 5000);
  });
}

// Cleanup on process exit
process.on('exit', () => {
  if (evalProcess) {
    evalProcess.kill('SIGKILL');
  }
});

process.on('SIGINT', () => {
  if (evalProcess) {
    evalProcess.kill('SIGKILL');
  }
  process.exit();
});

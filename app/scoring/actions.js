'use server'

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function runScoringJob() {
  try {
    // Root directory is now where the Next.js app is
    const projectRoot = process.cwd();
    
    // Call the virtual environment python specifically
    // On Windows, the path might be .venv\Scripts\python.exe. On Mac/Linux, .venv/bin/python
    const isWin = process.platform === "win32";
    const pythonExecutable = isWin ? '.venv\\Scripts\\python.exe' : '.venv/bin/python';
    
    // Timeout of 30 seconds
    const { stdout, stderr } = await execAsync(`${pythonExecutable} jobs/run_inference.py`, {
      cwd: projectRoot,
      timeout: 30000 
    });

    return { success: true, stdout, stderr };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || "Execution failed", 
      stderr: error.stderr || "",
      stdout: error.stdout || ""
    };
  }
}

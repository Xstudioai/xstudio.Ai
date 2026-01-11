import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { SYSTEM_INSTRUCTION } from '../constants';

export class LiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputNode: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private sourceStream: MediaStream | null = null;
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime = 0;
  private isConnected = false;
  private onVolumeChange: ((volume: number) => void) | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public setVolumeCallback(cb: (vol: number) => void) {
    this.onVolumeChange = cb;
  }

  public async connect(onClose: () => void, onError: (e: Error) => void) {
    if (this.isConnected) return;

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Allow browser to select native sample rate for better hardware compatibility
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Critical: Resume audio context to prevent browser autoplay blocking
      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }

      // Setup Analyser for visuals
      this.analyser = this.outputAudioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.analyser);
      this.analyser.connect(this.outputAudioContext.destination);

      // Start Visualizer Loop
      this.startVisualizer();

      this.sourceStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            this.isConnected = true;
            this.startAudioInputStream();
            
            // Trigger Welcome Message
            setTimeout(() => {
              this.sendTextContext("Por favor, preséntate brevemente con entusiasmo: '¡Hola! Soy Alex de TechVibe. ¿En qué puedo ayudarte hoy?'");
            }, 500);
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleServerMessage(message);
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            this.isConnected = false;
            onClose();
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live Error', e);
            onError(new Error("Connection error"));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

    } catch (err) {
      console.error('Failed to connect:', err);
      onError(err instanceof Error ? err : new Error('Unknown connection error'));
      this.disconnect();
    }
  }

  private startAudioInputStream() {
    if (!this.inputAudioContext || !this.sourceStream || !this.sessionPromise) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.sourceStream);
    this.inputNode = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.inputNode.onaudioprocess = (e) => {
      if (!this.isConnected) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(this.inputNode);
    this.inputNode.connect(this.inputAudioContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    if (!this.outputAudioContext || !this.outputNode) return;

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      // Sync logic to avoid drift
      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        this.outputAudioContext,
        24000,
        1
      );

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
    }

    if (message.serverContent?.interrupted) {
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  private startVisualizer() {
    if (!this.analyser || !this.onVolumeChange) return;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const update = () => {
      if (!this.isConnected || !this.analyser) {
        if(this.onVolumeChange) this.onVolumeChange(0);
        return;
      }
      this.analyser.getByteFrequencyData(dataArray);
      // Calculate average volume
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / dataArray.length;
      if (this.onVolumeChange) this.onVolumeChange(avg);
      requestAnimationFrame(update);
    };
    update();
  }

  /**
   * Sends a text context update to the avatar.
   * Useful for when a user clicks a button.
   */
  public async sendTextContext(text: string) {
    if (!this.sessionPromise || !this.isConnected) return;
    
    try {
      const session = await this.sessionPromise;
      // Providing text context as a user part to guide the model
      session.sendRealtimeInput([{ text }]);
    } catch (e) {
      console.error("Error sending text context", e);
    }
  }

  public disconnect() {
    this.isConnected = false;
    if (this.sourceStream) {
      this.sourceStream.getTracks().forEach(track => track.stop());
      this.sourceStream = null;
    }
    if (this.inputNode) {
      this.inputNode.disconnect();
      this.inputNode = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
  }
}

export const liveService = new LiveService();

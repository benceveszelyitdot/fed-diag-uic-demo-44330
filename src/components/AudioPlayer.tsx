import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Upload } from "lucide-react";
import { toast } from "sonner";

export const AudioPlayer = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "audio/mp3" || file.type === "audio/mpeg" || file.type === "audio/wav")) {
      setAudioFile(file);
      setIsPlaying(false);
      toast.success("Audio file loaded successfully");
    } else {
      toast.error("Please upload a valid MP3 or WAV file");
    }
  };

  const handlePlay = () => {
    if (!audioFile) {
      fileInputRef.current?.click();
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Audio Player</h2>
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {!audioFile ? (
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio
          </Button>
        ) : (
          <>
            <Button
              onClick={handlePlay}
              disabled={isPlaying}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
            </Button>

            <Button
              onClick={handlePause}
              disabled={!isPlaying}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
            >
              <Pause className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleStop}
              disabled={!audioFile}
              size="lg"
              variant="destructive"
              className="disabled:opacity-50"
            >
              <Square className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Change File
            </Button>
          </>
        )}
      </div>

      {audioFile && (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Playing: {audioFile.name}
          </p>
          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioFile)}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </>
      )}
    </Card>
  );
};

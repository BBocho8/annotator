"use client";

import { useState, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

import DrawingCanvas from "@/components/DrawingCanvas";
import Toolbar from "@/components/Toolbar";
import { Annotation, ToolType } from "@/types/tool";

function extractVideoId(url: string): string | null {
  // Handles normal, short, and embed YouTube URLs
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function YouTubeAnnotator() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawMode, setDrawMode] = useState<boolean>(false);
  const [currentTool, setCurrentTool] = useState<ToolType>("line");
  const [currentColor, setCurrentColor] = useState<string>("#ff0000");
  const [currentThickness, setCurrentThickness] = useState<number>(3);
  const [menuVisible, setMenuVisible] = useState<boolean>(true);

  // Load annotations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("yt_annotations");
    if (saved) {
      setAnnotations(JSON.parse(saved));
    }
  }, []);

  // Save annotations on every change
  useEffect(() => {
    localStorage.setItem("yt_annotations", JSON.stringify(annotations));
  }, [annotations]);

  const undoLastAnnotation = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
    localStorage.removeItem("yt_annotations");
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert("Invalid YouTube URL. Please enter a correct link.");
    }
  };

  const onPlayerReady: YouTubeProps["onReady"] = () => {
    console.log("YouTube Player is ready!");
  };

  return (
    <div className="relative w-screen h-screen bg-black">
      {!videoId ? (
        <form
          onSubmit={handleSubmitUrl}
          className="flex flex-col items-center justify-center h-full gap-4 bg-gray-900 text-white"
        >
          <h1 className="text-2xl font-semibold">Enter YouTube Video URL</h1>
          <input
            type="text"
            placeholder="Paste YouTube link here"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-80 p-2 rounded text-black"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Load Video
          </button>
        </form>
      ) : (
        <>
          {/* YouTube Player */}
          <YouTube
            videoId={videoId}
            onReady={onPlayerReady}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: { controls: 1 },
            }}
            className="absolute top-0 left-0 w-full h-full"
          />

          {/* Drawing Canvas */}
          <DrawingCanvas
            annotations={annotations}
            setAnnotations={setAnnotations}
            currentTool={currentTool}
            currentColor={currentColor}
            currentThickness={currentThickness}
            drawMode={drawMode}
          />

          {/* Toolbar */}
          <Toolbar
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            currentColor={currentColor}
            setCurrentColor={setCurrentColor}
            currentThickness={currentThickness}
            setCurrentThickness={setCurrentThickness}
            drawMode={drawMode}
            setDrawMode={setDrawMode}
            undo={undoLastAnnotation}
            clear={clearAllAnnotations}
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
          />
        </>
      )}
    </div>
  );
}

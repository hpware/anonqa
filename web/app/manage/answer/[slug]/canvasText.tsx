import { useEffect, useRef } from "react";

interface CanvasTextProps {
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
}

export function CanvasText({
  text,
  width = 600,
  height = 400,
  fontSize = 24,
  fontFamily = "Arial",
  textColor = "#000000",
  backgroundColor = "#ffffff",
}: CanvasTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Configure text
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // First split by explicit line breaks
    const paragraphs = text.split("\n\n");
    const allLines: string[] = [];

    // Process each paragraph
    paragraphs.forEach((paragraph) => {
      const words = paragraph.trim().split(" ");
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 40) {
          allLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        allLines.push(currentLine);
      }
      // Add an empty line between paragraphs
      allLines.push("");
    });

    // Remove the last empty line if it exists
    if (allLines[allLines.length - 1] === "") {
      allLines.pop();
    }

    // Draw text lines
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = allLines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2;

    allLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
  }, [text, width, height, fontSize, fontFamily, textColor, backgroundColor]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}

import { useState } from "react";
import { useWindowSize, useWindowScroll } from "react-use";
import Confetti from "react-confetti";
import { Toggle } from "./ui/toggle";
import {
  ConfettiMode,
  drawRedLeaves,
  drawSnowflake,
  drawWind,
} from "@/lib/confetti";

export const ConfettiControl = () => {
  const [currentMode, setCurrentMode] = useState<ConfettiMode>("confetti");
  const { width, height } = useWindowSize();
  const { y } = useWindowScroll();

  // Hide confetti when scrolled past the first viewport
  const isVisible = y < height * 0.7;

  const getConfettiColors = () => {
    switch (currentMode) {
      case "snow":
        return ["#AEE1FF", "#CBDDF8"];
      case "red-leaves":
        return ["#8B4513", "red", "orange"];
      default:
        return undefined;
    }
  };

  const getDrawShape = () => {
    switch (currentMode) {
      case "confetti":
        return undefined; // Default confetti shape
      case "snow":
        return drawSnowflake;
      case "red-leaves":
        return drawRedLeaves;
      case "wind":
        return drawWind;
      default:
        return undefined;
    }
  };

  const getNumberOfPieces = () => {
    if (currentMode === "off" || !isVisible) {
      return 0;
    }
    return undefined; // Use default
  };

  const handleToggleClick = () => {
    setCurrentMode((prev) => {
      switch (prev) {
        case "confetti":
          return "snow";
        case "snow":
          return "red-leaves";
        case "red-leaves":
          return "wind";
        case "wind":
          return "off";
        case "off":
          return "confetti";
        default:
          return "confetti";
      }
    });
  };

  const getEmoji = () => {
    switch (currentMode) {
      case "confetti":
        return "🎊";
      case "snow":
        return "❄️";
      case "red-leaves":
        return "🍂";
      case "wind":
        return "🌀";
      case "off":
        return "🤷‍♂️";
      default:
        return "🎊";
    }
  };

  return (
    <div className="">
      <Confetti
        width={width}
        height={height}
        numberOfPieces={getNumberOfPieces()}
        colors={getConfettiColors()}
        wind={0.003}
        drawShape={getDrawShape()}
      />
      <Toggle onClick={handleToggleClick}>{getEmoji()}</Toggle>
    </div>
  );
};

import { useCallback, useState, useRef } from "react";
import { CubeSimulator } from "@/utils/CubeSimulator";
import { ItemPotentialGrade } from "@/types/Equipment";
import rollCubeSound from "@/app/sound/ScrollSuccess.mp3";
import completeSound from "@/app/sound/AchievmentComplete.mp3";

const AUDIO_CONFIG = {
  rollCube: {
    src: rollCubeSound,
    volume: 0.35,
  },
  gradeUp: {
    src: completeSound,
    volume: 0.15,
  },
} as const;

export const useCubeSimulation = (cubeSimulator: CubeSimulator) => {
  const [prevOptions, setPrevOptions] = useState<string[]>([]);
  const [newOptions, setNewOptions] = useState<string[]>([]);
  const [prevGrade, setPrevGrade] = useState<ItemPotentialGrade>();
  const [afterGrade, setAfterGrade] = useState<ItemPotentialGrade>();
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentGuarantee, setCurrentGuarantee] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const rollAudio = useRef(new Audio(AUDIO_CONFIG.rollCube.src));
  const gradeUpAudio = useRef(new Audio(AUDIO_CONFIG.gradeUp.src));
  const prevAttempt = useRef<number>(0);

  const playSound = useCallback(
    (type: "roll" | "gradeUp") => {
      if (!isSoundEnabled) return;

      const audio = type === "roll" ? rollAudio.current : gradeUpAudio.current;
      audio.pause();
      audio.currentTime = 0;
      audio.play();
    },
    [isSoundEnabled]
  );

  const rollCube = useCallback(() => {
    cubeSimulator.rollCube();
    playSound("roll");

    const {
      prevOptions,
      currentOptions,
      prevGrade: simulatorPrevGrade,
      currentGrade: simulatorCurrentGrade,
      currentAttempt,
      currentGuarantee,
    } = cubeSimulator.getItemState();

    setPrevOptions(prevOptions);
    setNewOptions(currentOptions);
    setPrevGrade(simulatorPrevGrade);
    setAfterGrade(simulatorCurrentGrade);
    setCurrentAttempt(currentAttempt);
    setCurrentGuarantee(currentGuarantee);

    if (simulatorPrevGrade !== simulatorCurrentGrade) {
      playSound("gradeUp");
    }
  }, [cubeSimulator, playSound]);

  const resetCurrentAttempt = useCallback(() => {
    cubeSimulator.setCurrentAttempt(0);
    setCurrentAttempt(0);
    prevAttempt.current = 0;
  }, [cubeSimulator]);

  return {
    prevOptions,
    newOptions,
    prevGrade,
    afterGrade,
    currentAttempt,
    currentGuarantee,
    isSoundEnabled,
    prevAttempt,
    setIsSoundEnabled,
    rollCube,
    setPrevOptions,
    setPrevGrade,
    resetCurrentAttempt,
  };
};

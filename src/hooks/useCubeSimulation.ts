import { useCallback, useState, useRef } from "react";
import { CubeSimulator } from "@/utils/CubeSimulator";
import { ItemPotentialGrade } from "@/types/Equipment";
import rollCubeSound from "@/app/sound/ScrollSuccess.mp3";
import completeSound from "@/app/sound/AchievmentComplete.mp3";

const AUDIO_CONFIG = {
  rollCube: {
    src: rollCubeSound,
    volume: 0.05,
  },
  gradeUp: {
    src: completeSound,
    volume: 0.03,
  },
} as const;

const rollAudio = new Audio(AUDIO_CONFIG.rollCube.src);
rollAudio.volume = AUDIO_CONFIG.rollCube.volume;

const gradeUpAudio = new Audio(AUDIO_CONFIG.gradeUp.src);
gradeUpAudio.volume = AUDIO_CONFIG.gradeUp.volume;

export const useCubeSimulation = (cubeSimulator: CubeSimulator) => {
  const [prevOptions, _setPrevOptions] = useState<string[]>([]);
  const [newOptions, setNewOptions] = useState<string[]>([]);
  const [prevGrade, setPrevGrade] = useState<ItemPotentialGrade>();
  const [afterGrade, setAfterGrade] = useState<ItemPotentialGrade>();
  const [mesoCost, _setMesoCost] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentGuarantee, setCurrentGuarantee] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const playSound = useCallback(
    (type: "roll" | "gradeUp") => {
      if (!isSoundEnabled) return;

      const audio = type === "roll" ? rollAudio : gradeUpAudio;
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
      mesoCost,
    } = cubeSimulator.getItemState();

    _setPrevOptions(prevOptions);
    setNewOptions(currentOptions);
    setPrevGrade(simulatorPrevGrade);
    setAfterGrade(simulatorCurrentGrade);
    setCurrentAttempt(currentAttempt);
    setCurrentGuarantee(currentGuarantee);
    setMesoCost(mesoCost);

    if (simulatorPrevGrade !== simulatorCurrentGrade) {
      playSound("gradeUp");
    }
  }, [cubeSimulator, playSound]);

  const resetCurrentAttempt = useCallback(() => {
    cubeSimulator.setCurrentAttempt(0);
    setCurrentAttempt(0);
  }, [cubeSimulator]);

  const setPrevOptions = useCallback(
    (options: string[]) => {
      cubeSimulator.setPrevOptions(options);
      _setPrevOptions(options);
    },
    [cubeSimulator]
  );

  const setMesoCost = useCallback(
    (cost: number) => {
      cubeSimulator.setMesoCost(cost);
      _setMesoCost(cost);
    },
    [cubeSimulator]
  );

  return {
    prevOptions,
    newOptions,
    prevGrade,
    afterGrade,
    currentAttempt,
    currentGuarantee,
    mesoCost,
    isSoundEnabled,
    setIsSoundEnabled,
    rollCube,
    setPrevOptions,
    setPrevGrade,
    resetCurrentAttempt,
    setMesoCost,
  };
};

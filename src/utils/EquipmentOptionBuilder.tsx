import type { ReactElement } from "react";

export class EquipOptionBuilder {
  private elements: ReactElement[] = [];
  private isPercent = false;

  constructor(isPercent: boolean) {
    this.isPercent = isPercent;
  }

  private getOptionString({
    option = "0",
    isSign = true,
  }: {
    option: string | undefined;
    isSign?: boolean;
  }) {
    const sign = parseInt(option) < 0 ? "-" : "+";
    const customStr = !isSign ? `${option}` : ` ${sign}${option}`;
    return this.isPercent ? `${customStr}%` : `${customStr}`;
  }

  applyBaseOption(option: string) {
    this.elements.push(
      <span className="text-white">
        {this.getOptionString({ option, isSign: false })}
      </span>
    );
    return this;
  }

  applyAddOption(option?: string) {
    if (!option || option === "0") return this;
    this.elements.push(
      <span className="text-lime-400">{this.getOptionString({ option })}</span>
    );
    return this;
  }

  applyEtcOption(option?: string) {
    if (!option || option === "0") return this;
    this.elements.push(
      <span className="text-indigo-300">
        {this.getOptionString({ option })}
      </span>
    );
    return this;
  }

  applyStarforceOption(option?: string) {
    if (!option || option === "0") return this;
    this.elements.push(
      <span className="text-yellow-500">
        {this.getOptionString({ option })}
      </span>
    );
    return this;
  }

  build() {
    return this.elements;
  }
}

import type { ReactElement } from "react";

export class EquipOptionBuilder {
  private elements: ReactElement[] = [];
  private isPercentage = false;

  constructor(isPercentage: boolean) {
    this.isPercentage = isPercentage;
  }

  private getOptionString({
    option,
    isSign = true,
  }: {
    option: string | undefined;
    isSign?: boolean;
  }) {
    if (!option) return "";
    const sign = parseInt(option) < 0 ? "-" : "+";
    const customStr = !isSign ? `${option}` : ` ${sign}${option}`;
    return this.isPercentage ? `${customStr}%` : `${customStr}`;
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
      <span className="text-yellow-600">
        {this.getOptionString({ option })}
      </span>
    );
    return this;
  }

  build() {
    return this.elements;
  }
}

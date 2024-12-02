export interface ICalculator {
  calculateCalories(image: string): number
}

export class Calculator implements ICalculator {
  public readonly calculateCalories = (_: string) => {
    return 0
  }
}

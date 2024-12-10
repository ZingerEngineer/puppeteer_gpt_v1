export interface ICalculator {
  calculateCalories(imageURL: string): Promise<number>
}

export class Calculator implements ICalculator {
  public readonly calculateCalories = async (_: string) => {
    return 0
  }
}

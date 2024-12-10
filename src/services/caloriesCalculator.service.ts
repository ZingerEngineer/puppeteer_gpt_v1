import { Calculator, ICalculator } from './types'

export class CaloriesClaculator {
  private selectedClaculator: ICalculator

  constructor(calculator: typeof Calculator) {
    this.selectedClaculator = new calculator()
  }

  public readonly calculateCalories = (image: string) => {
    return this.selectedClaculator.calculateCalories(image)
  }
}

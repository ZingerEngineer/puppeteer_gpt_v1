import { ICalculator } from './types'

export class CaloriesClaculatorLLM implements ICalculator {
  public readonly calculateCalories = async (imageURL: string) => {
    // Mocked response

    const llm = () => {}
    return 2000
  }
}

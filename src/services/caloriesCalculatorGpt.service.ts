import { ICalculator } from './types'

export class CaloriesClaculatorGPT implements ICalculator {
  public readonly calculateCalories = (image: string) => {
    // Mocked response

    const puppeteer = () => {}
    return 2000
  }
}

export const caloriesCalculatorGpt = () => {
  const calculateCalories = (image: string) => {
    // Mocked response

    const puppeteer = () => {}
    return 2000
  }

  return { calculateCalories } satisfies ICalculator
}

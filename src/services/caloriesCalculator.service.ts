import {
  Calculator,
  ICalculator,
  IPrompterCalculator,
  PropmterCalculator
} from './types'

export class CaloriesClaculator {
  private selectedClaculator: ICalculator

  constructor(calculator: typeof Calculator) {
    this.selectedClaculator = new calculator()
  }

  public readonly calculateCalories = (image: string) => {
    return this.selectedClaculator.calculateCalories(image)
  }
}

export class PrompterCaloriesClaculator {
  private selectedClaculator: IPrompterCalculator

  constructor(calculator: typeof PropmterCalculator) {
    this.selectedClaculator = new calculator()
  }

  public readonly prompterCalculateCalories = (
    providerEmail: string,
    providerPassword: string,
    imageURL: string,
    prompt: string
  ) => {
    return this.selectedClaculator.calculateCalories(
      providerEmail,
      providerPassword,
      imageURL,
      prompt
    )
  }
}

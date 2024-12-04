export interface ICalculator {
  calculateCalories(image: string): number
}

export interface IPrompterCalculator {
  calculateCalories(
    providerEmail: string,
    providerPassword: string,
    imageURL: string,
    prompt: string
  ): Promise<number>
}

export class Calculator implements ICalculator {
  public readonly calculateCalories = (_: string) => {
    return 0
  }
}

export class PropmterCalculator implements IPrompterCalculator {
  public readonly calculateCalories = (
    _: string,
    __: string,
    ___: string,
    ____: string
  ) => {
    return Promise.resolve(0)
  }
}

export class ChatGPTPrompter implements IPrompterCalculator {
  public readonly calculateCalories = (
    _: string,
    __: string,
    ___: string,
    ____: string
  ) => {
    return Promise.resolve(0)
  }
}

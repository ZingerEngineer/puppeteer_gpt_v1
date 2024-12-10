import dotenv from 'dotenv'
import { CaloriesClaculator } from './services/caloriesCalculator.service'
import { CaloriesClaculatorGPT } from './services/caloriesCalculatorGpt.service'
import { CaloriesClaculatorLLM } from './services/caloriesCalculatorLLM.service'

dotenv.config()

const calculator = process.env.CALCULATOR_SECRET

// Usage
;(async () => {
  const imageURL = 'C:/apps/puppeteer_gpt_v1/images/bananas.jpg'
  try {
    const caloriesCalculator = new CaloriesClaculator(CaloriesClaculatorGPT)
    const calories = await caloriesCalculator.calculateCalories(imageURL)

    console.log('Calories:', calories)
  } catch (error) {
    console.error('Error:', error)
  }
})()

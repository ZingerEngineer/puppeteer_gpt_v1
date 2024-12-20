import dotenv from 'dotenv'
import path from 'path'
import { CaloriesClaculator } from './services/caloriesCalculator.service'
import { CaloriesClaculatorGPT } from './services/caloriesCalculatorGpt.service'
import { CaloriesClaculatorLLM } from './services/caloriesCalculatorLLM.service'

dotenv.config()

const imagePath = path.resolve(__dirname, '../images')
const calculationMethod = process.env.CURRENT_CALCULATOR_SECRET

// Usage
;(async () => {
  const imageURL = `${imagePath}/bananas.jpg`
  try {
    if (calculationMethod === 'GPT') {
      const caloriesCalculator = new CaloriesClaculator(CaloriesClaculatorGPT)
      const calories = await caloriesCalculator.calculateCalories(imageURL)
      console.log('Calories:', calories)
    }
    const caloriesCalculator = new CaloriesClaculator(CaloriesClaculatorLLM)
    const calories = await caloriesCalculator.calculateCalories(imageURL)
    console.log('Calories:', calories)
  } catch (error) {
    console.error('Error:', error)
  }
})()

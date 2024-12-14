import dotenv from 'dotenv'
import path from 'path'
import { CaloriesClaculator } from './services/caloriesCalculator.service'
import { CaloriesClaculatorGPT } from './services/caloriesCalculatorGpt.service'
import { CaloriesClaculatorLLM } from './services/caloriesCalculatorLLM.service'

dotenv.config()

const imagePath = path.resolve(__dirname, '../images')
const calculator = process.env.CALCULATOR_SECRET

// Usage
;(async () => {
  const imageURL = `${imagePath}/bananas.jpg`
  try {
    const caloriesCalculator = new CaloriesClaculator(CaloriesClaculatorGPT)
    const calories = await caloriesCalculator.calculateCalories(imageURL)

    console.log('Calories:', calories)
  } catch (error) {
    console.error('Error:', error)
  }
})()


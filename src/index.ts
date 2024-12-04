import dotenv from 'dotenv'
import { PrompterCaloriesClaculator } from './services/caloriesCalculator.service'
import { CaloriesClaculatorGPT } from './services/caloriesCalculatorGpt.service'
import { CaloriesClaculatorLLM } from './services/caloriesCalculatorLLM.service'

dotenv.config()

// Usage
;(async () => {
  const email = process.env.EMAIL_SECRET
  const password = process.env.PASSWORD_SECRET
  const prompt =
    'How much calories are in the food inside this image? Criteria: Consider number of elements in the image, color, and size of the elements. Reply only with the total calories calculated in numbers.'
  const imageURL = 'C:/apps/scrap_gpt/images/bananas.jpg'
  try {
    if (!email || !password) {
      throw new Error('Please provide email and password in .env file')
    }
    const caloriesCalculator = new PrompterCaloriesClaculator(
      CaloriesClaculatorGPT
    )
    const calories = await caloriesCalculator.prompterCalculateCalories(
      email,
      password,
      prompt,
      imageURL
    )

    console.log('Calories:', calories)
  } catch (error) {
    console.error('Error:', error)
  }
})()

import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import dotenv from 'dotenv'
import { CaloriesClaculator } from './services/caloriesCalculator.service'
import { CaloriesClaculatorGPT } from './services/caloriesCalculatorGpt.service'
import { CaloriesClaculatorLLM } from './services/caloriesCalculatorLLM.service'

dotenv.config()
puppeteer.use(StealthPlugin())

async function loginAndSendPrompt(
  email: string,
  password: string,
  prompt: string
) {
  let response: string | null = null

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  // Navigate to ChatGPT login page
  await page.goto('https://chat.openai.com')

  await page.waitForNavigation({
    waitUntil: 'networkidle0'
  })

  await page.waitForSelector('button.btn-primary[data-testid="login-button"]', {
    visible: true
  })
  await page.click('button.btn-primary[data-testid="login-button"]')

  await page.waitForSelector('.social-btn', {
    visible: true
  })
  await page.evaluate(() => {
    console.log('filtering')
    const microsoftButton = Array.from(
      document.getElementsByTagName('IMG')
    ).filter((img) => (img as HTMLImageElement).src.includes('microsoft'))[0]
      .parentElement?.parentElement as HTMLButtonElement
    console.log(microsoftButton)
    if (microsoftButton) {
      console.log('clicking')
      microsoftButton.click()
    }
  })

  await page.waitForSelector('input[type="email"], input[type="password"]', {
    visible: true
  })

  // Enter email address
  await page.type('input[type="email"]', email)
  await page.keyboard.press('Enter')

  // Wait for password input
  await page.waitForSelector('input[type="password"]', { visible: true })
  await page.type('input[type="password"]', password)
  await page.keyboard.press('Enter')

  await page.waitForNavigation({
    waitUntil: 'networkidle0'
  })
  await page.click('button[id="declineButton"]')

  // Wait for ChatGPT interface to load
  await page.waitForSelector('textarea', { visible: true })

  // Type and send the prompt
  await page.type('textarea', prompt, {
    delay: 20
  })

  await page.waitForSelector('button[data-testid="send-button"]', {
    visible: true
  })
  await page.click('button[data-testid="send-button"]')

  const textMessage = await page.waitForSelector(
    'div[data-message-author-role="assistant"]',
    {
      visible: true
    }
  )
  await page.waitForSelector('button[data-testid="send-button"]', {
    visible: true
  })

  response = await page.evaluate(() => {
    const divMessage = document.querySelector(
      'div[data-message-author-role="assistant"]'
    )
    console.log('divMessage', divMessage)

    if (!divMessage) {
      throw new Error('No message found')
    }

    const pElement = divMessage.children[0].children[0]
      .children[0] as HTMLParagraphElement
    return Promise.resolve(pElement.innerText)
  })

  console.log(response)
  // Close the browser
  await browser.close()
}

// Usage

;(() => {
  const email = process.env.EMAIL_SECRET
  const password = process.env.PASSWORD_SECRET
  const prompt = 'What is javascript?'

  console.log(email)
  try {
    if (!email || !password) {
      throw new Error('Please provide email and password in .env file')
    }
    if (email && password) {
      loginAndSendPrompt(email, password, prompt)
    }
  } catch (error) {
    console.error('Error:', error)
  }
})()

const image = ''

const caloriesCalculator = new CaloriesClaculator(CaloriesClaculatorGPT)
const calories = caloriesCalculator.calculateCalories(image)

console.log(calories)
